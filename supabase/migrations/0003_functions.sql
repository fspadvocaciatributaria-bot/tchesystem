-- =============================================================================
-- FSP — RPCs e funções de negócio críticas (executadas server-side, sob RLS)
-- =============================================================================

-- ---------- Auditoria: append-only via SECURITY DEFINER ----------------------
create or replace function audit_log(
  p_org uuid, p_table text, p_record uuid, p_action text,
  p_old jsonb default null, p_new jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs(organization_id, user_id, table_name, record_id, action, old_row, new_row)
  values (p_org, auth.uid(), p_table, p_record, p_action, p_old, p_new);
end $$;

-- ---------- Criação de organização + membership owner (atômica) --------------
create or replace function create_organization(p_name text, p_profession uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into organizations(name, profession_id) values (p_name, p_profession) returning id into v_org;
  insert into memberships(organization_id, user_id, role) values (v_org, auth.uid(), 'owner');
  insert into settings(organization_id) values (v_org);
  perform audit_log(v_org, 'organizations', v_org, 'create', null, jsonb_build_object('name', p_name));
  return v_org;
end $$;

-- ---------- Movimentação de estoque: atualiza saldo e custo médio ------------
-- Fonte única da verdade para mexer no estoque. Recalcula custo médio (D-002)
-- em entradas, previne estoque negativo em saídas, exige justificativa em ajuste.
create or replace function register_inventory_movement(
  p_org uuid, p_product uuid, p_type movement_type, p_qty numeric,
  p_unit_cost numeric default null, p_supplier uuid default null,
  p_reason text default null, p_document text default null, p_service uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_prod products%rowtype; v_new_stock numeric; v_new_avg numeric; v_mov uuid;
begin
  if not auth_can_write(p_org) then raise exception 'forbidden'; end if;
  if p_qty <= 0 then raise exception 'quantity must be > 0'; end if;

  select * into v_prod from products where id = p_product and organization_id = p_org for update;
  if not found then raise exception 'product not found'; end if;

  if p_type = 'in' then
    if p_unit_cost is null then raise exception 'unit_cost required for entry'; end if;
    v_new_stock := v_prod.stock_current + p_qty;
    v_new_avg := case when v_new_stock = 0 then v_prod.avg_cost
                 else (v_prod.stock_current * v_prod.avg_cost + p_qty * p_unit_cost) / v_new_stock end;
  elsif p_type = 'out' then
    v_new_stock := v_prod.stock_current - p_qty;
    if v_new_stock < 0 then raise exception 'insufficient stock'; end if;
    v_new_avg := v_prod.avg_cost;
  else -- adjustment: p_qty é o delta absoluto positivo; sinal via reason
    if p_reason is null then raise exception 'adjustment requires reason'; end if;
    v_new_stock := p_qty;  -- ajuste define o saldo diretamente
    v_new_avg := v_prod.avg_cost;
  end if;

  insert into inventory_movements(organization_id, product_id, type, quantity, unit_cost,
      supplier_id, reason, document_number, related_service_id, created_by)
  values (p_org, p_product, p_type, p_qty, p_unit_cost, p_supplier, p_reason, p_document, p_service, auth.uid())
  returning id into v_mov;

  update products
    set stock_current = v_new_stock,
        avg_cost = v_new_avg,
        acquisition_cost = coalesce(p_unit_cost, acquisition_cost)
    where id = p_product;

  perform audit_log(p_org, 'inventory_movements', v_mov, p_type::text,
    jsonb_build_object('stock', v_prod.stock_current, 'avg_cost', v_prod.avg_cost),
    jsonb_build_object('stock', v_new_stock, 'avg_cost', v_new_avg));
  return v_mov;
end $$;

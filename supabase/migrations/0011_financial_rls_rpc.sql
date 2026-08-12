-- =============================================================================
-- FSP — Financeiro: RLS + RPCs de baixa/estorno (atômicas)
-- =============================================================================
do $$
declare t text;
  tbls text[] := array['classification_categories','financial_accounts','transactions','transaction_payments'];
begin
  foreach t in array tbls loop
    execute format('alter table %I enable row level security;', t);
    execute format($f$ create policy %1$s_select on %1$I for select using (organization_id in (select auth_org_ids())); $f$, t);
    execute format($f$ create policy %1$s_insert on %1$I for insert with check (organization_id in (select auth_org_ids()) and auth_can_write(organization_id)); $f$, t);
    execute format($f$ create policy %1$s_update on %1$I for update using (organization_id in (select auth_org_ids()) and auth_can_write(organization_id)); $f$, t);
    execute format($f$ create policy %1$s_delete on %1$I for delete using (organization_id in (select auth_org_ids()) and auth_can_write(organization_id)); $f$, t);
  end loop;
end $$;

create or replace function register_payment(
  p_tx uuid, p_amount numeric, p_date date, p_method payment_method,
  p_account uuid default null, p_receipt text default null, p_obs text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_tx transactions%rowtype; v_new_paid numeric; v_status transaction_status; v_pay uuid;
begin
  select * into v_tx from transactions where id = p_tx for update;
  if not found then raise exception 'título não encontrado'; end if;
  if not auth_can_write(v_tx.organization_id) then raise exception 'forbidden'; end if;
  if p_amount <= 0 then raise exception 'valor deve ser > 0'; end if;
  v_new_paid := v_tx.paid_amount + p_amount;
  if v_new_paid >= v_tx.amount then v_status := 'paid';
  elsif v_new_paid > 0 then v_status := 'partial'; else v_status := 'pending'; end if;
  insert into transaction_payments(organization_id, transaction_id, paid_amount, payment_date,
      payment_method, financial_account_id, receipt_reference, observation, created_by)
  values (v_tx.organization_id, p_tx, p_amount, p_date, p_method, p_account, p_receipt, p_obs, auth.uid())
  returning id into v_pay;
  update transactions set paid_amount = v_new_paid, status = v_status,
      payment_date = case when v_status = 'paid' then p_date else payment_date end where id = p_tx;
  return v_pay;
end $$;

create or replace function reverse_payment(p_payment uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_pay transaction_payments%rowtype; v_tx transactions%rowtype; v_new_paid numeric; v_status transaction_status;
begin
  select * into v_pay from transaction_payments where id = p_payment;
  if not found then raise exception 'baixa não encontrada'; end if;
  if not auth_can_write(v_pay.organization_id) then raise exception 'forbidden'; end if;
  select * into v_tx from transactions where id = v_pay.transaction_id for update;
  v_new_paid := greatest(0, v_tx.paid_amount - v_pay.paid_amount);
  if v_new_paid >= v_tx.amount then v_status := 'paid';
  elsif v_new_paid > 0 then v_status := 'partial'; else v_status := 'pending'; end if;
  delete from transaction_payments where id = p_payment;
  update transactions set paid_amount = v_new_paid, status = v_status,
      payment_date = case when v_status = 'paid' then payment_date else null end where id = v_tx.id;
end $$;

revoke execute on function register_payment(uuid, numeric, date, payment_method, uuid, text, text) from anon;
revoke execute on function reverse_payment(uuid) from anon;
grant execute on function register_payment(uuid, numeric, date, payment_method, uuid, text, text) to authenticated;
grant execute on function reverse_payment(uuid) to authenticated;

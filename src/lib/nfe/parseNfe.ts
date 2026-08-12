// Parser de XML fiscal (NF-e modelo 55 e NFC-e modelo 65).
// Ambos compartilham a estrutura infNFe. Função pura: recebe o XML como string
// e devolve os dados estruturados. Testável com jsdom.

export interface NfeItem {
  codigo: string;
  ean: string | null;
  descricao: string;
  ncm: string | null;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NfeEmitente {
  cnpj: string | null;
  nome: string;
  fantasia: string | null;
  ie: string | null;
  telefone: string | null;
  endereco: string | null;
}

export interface NfeParty {
  cnpj: string | null;
  nome: string | null;
}

export interface NfeParsed {
  model: 'NFe' | 'NFC-e' | 'desconhecido';
  chave: string | null;
  numero: string | null;
  serie: string | null;
  dataEmissao: string | null; // ISO
  dataSaida: string | null; // dhSaiEnt
  emitente: NfeEmitente;
  destinatario: NfeParty;
  itens: NfeItem[];
  totalProdutos: number;
  totalNota: number;
  frete: number;
  desconto: number;
}

function tagText(root: Element | Document, tag: string): string | null {
  const el = root.getElementsByTagName(tag)[0];
  return el?.textContent?.trim() || null;
}

function num(v: string | null): number {
  if (!v) return 0;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Faz o parse de um XML de NF-e/NFC-e. Lança erro se o XML for inválido. */
export function parseNfe(xml: string): NfeParsed {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('XML inválido ou corrompido.');
  }
  const infNFe = doc.getElementsByTagName('infNFe')[0];
  if (!infNFe) throw new Error('Não é um XML de NF-e/NFC-e (infNFe ausente).');

  // Chave de acesso: atributo Id = "NFe" + 44 dígitos
  const rawId = infNFe.getAttribute('Id') || '';
  const chave = rawId.replace(/^NFe/i, '') || null;

  const mod = tagText(infNFe, 'mod');
  const model = mod === '65' ? 'NFC-e' : mod === '55' ? 'NFe' : 'desconhecido';

  const emit = infNFe.getElementsByTagName('emit')[0];
  const ender = emit?.getElementsByTagName('enderEmit')[0] ?? null;
  const endereco = ender
    ? [
        tagText(ender, 'xLgr'),
        tagText(ender, 'nro'),
        tagText(ender, 'xBairro'),
        tagText(ender, 'xMun'),
        tagText(ender, 'UF'),
      ]
        .filter(Boolean)
        .join(', ') || null
    : null;

  const emitente: NfeEmitente = {
    cnpj: emit ? tagText(emit, 'CNPJ') || tagText(emit, 'CPF') : null,
    nome: (emit && tagText(emit, 'xNome')) || 'Fornecedor',
    fantasia: emit ? tagText(emit, 'xFant') : null,
    ie: emit ? tagText(emit, 'IE') : null,
    telefone: ender ? tagText(ender, 'fone') : null,
    endereco,
  };

  const itens: NfeItem[] = [];
  const dets = infNFe.getElementsByTagName('det');
  for (let i = 0; i < dets.length; i++) {
    const prod = dets[i].getElementsByTagName('prod')[0];
    if (!prod) continue;
    const ean = tagText(prod, 'cEAN');
    itens.push({
      codigo: tagText(prod, 'cProd') || '',
      ean: ean && ean !== 'SEM GTIN' ? ean : null,
      descricao: tagText(prod, 'xProd') || 'Item',
      ncm: tagText(prod, 'NCM'),
      unidade: tagText(prod, 'uCom') || 'UN',
      quantidade: num(tagText(prod, 'qCom')),
      valorUnitario: num(tagText(prod, 'vUnCom')),
      valorTotal: num(tagText(prod, 'vProd')),
    });
  }

  const ide = infNFe.getElementsByTagName('ide')[0] ?? infNFe;
  const total = infNFe.getElementsByTagName('total')[0] ?? infNFe;
  const dest = infNFe.getElementsByTagName('dest')[0] ?? null;

  const destinatario: NfeParty = {
    cnpj: dest ? tagText(dest, 'CNPJ') || tagText(dest, 'CPF') : null,
    nome: dest ? tagText(dest, 'xNome') : null,
  };

  return {
    model,
    chave,
    numero: tagText(ide, 'nNF'),
    serie: tagText(ide, 'serie'),
    dataEmissao: tagText(ide, 'dhEmi') || tagText(ide, 'dEmi'),
    dataSaida: tagText(ide, 'dhSaiEnt'),
    emitente,
    destinatario,
    itens,
    totalProdutos: num(tagText(total, 'vProd')),
    totalNota: num(tagText(total, 'vNF')) || itens.reduce((s, it) => s + it.valorTotal, 0),
    frete: num(tagText(total, 'vFrete')),
    desconto: num(tagText(total, 'vDesc')),
  };
}

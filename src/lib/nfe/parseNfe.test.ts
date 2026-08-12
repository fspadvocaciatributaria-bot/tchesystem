import { describe, it, expect } from 'vitest';
import { parseNfe } from './parseNfe';

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35240612345678000199650010000001231000001231" versao="4.00">
      <ide>
        <mod>65</mod>
        <serie>1</serie>
        <nNF>123</nNF>
        <dhEmi>2026-08-01T10:00:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678000199</CNPJ>
        <xNome>Distribuidora Tattoo Supply LTDA</xNome>
        <xFant>Tattoo Supply</xFant>
        <IE>1234567890</IE>
        <enderEmit>
          <xLgr>Rua das Agulhas</xLgr>
          <nro>100</nro>
          <xBairro>Centro</xBairro>
          <xMun>Porto Alegre</xMun>
          <UF>RS</UF>
          <fone>5133334444</fone>
        </enderEmit>
      </emit>
      <det nItem="1">
        <prod>
          <cProd>AG-RL-07</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Agulha RL 07</xProd>
          <NCM>90183900</NCM>
          <uCom>UN</uCom>
          <qCom>100.0000</qCom>
          <vUnCom>1.5000</vUnCom>
          <vProd>150.00</vProd>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>TINTA-PT</cProd>
          <cEAN>SEM GTIN</cEAN>
          <xProd>Tinta Preta 30ml</xProd>
          <NCM>32041790</NCM>
          <uCom>ML</uCom>
          <qCom>500.0000</qCom>
          <vUnCom>0.8000</vUnCom>
          <vProd>400.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vProd>550.00</vProd>
          <vNF>550.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

describe('parseNfe', () => {
  const r = parseNfe(SAMPLE);

  it('detecta modelo NFC-e (mod 65)', () => {
    expect(r.model).toBe('NFC-e');
  });
  it('extrai chave, número e série', () => {
    expect(r.chave).toBe('35240612345678000199650010000001231000001231');
    expect(r.numero).toBe('123');
    expect(r.serie).toBe('1');
  });
  it('extrai o emitente', () => {
    expect(r.emitente.cnpj).toBe('12345678000199');
    expect(r.emitente.nome).toContain('Distribuidora Tattoo Supply');
    expect(r.emitente.endereco).toContain('Porto Alegre');
  });
  it('extrai os itens com quantidades e custos', () => {
    expect(r.itens).toHaveLength(2);
    expect(r.itens[0]).toMatchObject({
      codigo: 'AG-RL-07',
      ean: '7891234567890',
      descricao: 'Agulha RL 07',
      quantidade: 100,
      valorUnitario: 1.5,
    });
    // "SEM GTIN" vira null
    expect(r.itens[1].ean).toBeNull();
  });
  it('total da nota', () => {
    expect(r.totalNota).toBe(550);
  });
  it('rejeita XML sem infNFe', () => {
    expect(() => parseNfe('<x>oi</x>')).toThrow();
  });
});

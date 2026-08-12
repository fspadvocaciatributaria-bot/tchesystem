import { describe, it, expect } from 'vitest';
import { formatBRL, formatPercent, round2, parseBRLNumber } from './format';

describe('money format (D-007)', () => {
  it('formata BRL no padrão pt-BR', () => {
    // usa espaço não separável ( ) entre R$ e o número
    expect(formatBRL(1250)).toBe('R$ 1.250,00');
    expect(formatBRL(0)).toBe('R$ 0,00');
    expect(formatBRL(null)).toBe('R$ 0,00');
    expect(formatBRL(NaN)).toBe('R$ 0,00');
  });
  it('formata percentual', () => {
    expect(formatPercent(0.3)).toBe('30%');
    expect(formatPercent(0.155)).toBe('15,5%');
  });
  it('round2', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.674)).toBe(2.67);
  });
  it('parseBRLNumber', () => {
    expect(parseBRLNumber('1.250,50')).toBe(1250.5);
    expect(parseBRLNumber('abc')).toBe(0);
    expect(parseBRLNumber('')).toBe(0);
  });
});

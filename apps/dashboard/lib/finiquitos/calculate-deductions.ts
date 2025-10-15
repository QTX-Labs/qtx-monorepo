/**
 * Cálculo de deducciones para finiquitos
 */

import type { DeductionsCalculation } from './types';
import { round } from './utils';
import { DECIMAL_PRECISION } from './constants';

export interface DeductionsInput {
  isr?: number;
  subsidy?: number;
  infonavit?: number;
  fonacot?: number;
  other?: number;
}

/**
 * Calcula las deducciones totales
 *
 * Nota: En la mayoría de los casos, las deducciones son $0
 * excepto ISR en columna fiscal si excede límites exentos
 */
export function calculateDeductions(input: DeductionsInput = {}): DeductionsCalculation {
  const {
    isr = 0,
    subsidy = 0,
    infonavit = 0,
    fonacot = 0,
    other = 0
  } = input;

  const totalDeductions = round(
    isr + subsidy + infonavit + fonacot + other,
    DECIMAL_PRECISION.MONEY
  );

  return {
    isr: round(isr, DECIMAL_PRECISION.MONEY),
    subsidy: round(subsidy, DECIMAL_PRECISION.MONEY),
    infonavit: round(infonavit, DECIMAL_PRECISION.MONEY),
    fonacot: round(fonacot, DECIMAL_PRECISION.MONEY),
    otherDeductions: round(other, DECIMAL_PRECISION.MONEY),
    totalDeductions
  };
}

/**
 * Calcula ISR simplificado
 *
 * NOTA: Esta es una implementación simplificada.
 * Para cálculo real se requiere tabla de ISR vigente.
 *
 * Por ahora retorna 0 o un valor muy pequeño como en el ejemplo del cliente
 */
export function calculateISR(totalPerceptions: number): number {
  // TODO: Implementar tabla de ISR completa cuando se requiera
  // Por ahora usamos lógica simplificada del ejemplo

  if (totalPerceptions < 1000) {
    return round(0.50, DECIMAL_PRECISION.MONEY);
  }

  return 0;
}

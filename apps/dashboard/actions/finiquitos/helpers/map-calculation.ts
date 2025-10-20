import { Decimal } from '@prisma/client/runtime/library';
import type { CalculateFiniquitoOutput } from '~/lib/finiquitos/types/calculate-finiquito-types';

/**
 * Mapea el resultado de calculateFiniquitoComplete a campos de Prisma (versión 2)
 *
 * IMPORTANTE: Este mapeo usa campos de versión 2 del modelo Finiquito.
 * Todos los finiquitos nuevos se crean con version = 2.
 *
 * Estructura de campos v2:
 * - Finiquito: factorXXXFiniquito, montoXXXFiniquito
 * - Liquidación: factorXXX, montoXXX (sin sufijo)
 * - Complemento: factorXXXComplemento, montoXXXComplemento
 * - Total final: totalAPagar (NO totalToPay)
 *
 * Campos v1 deprecated (no se usan):
 * - realVacationAmount, realVacationPremiumAmount, realAguinaldoAmount
 * - realWorkedDaysAmount, totalToPay
 *
 * Conversiones:
 * - Números a Decimal de Prisma para precisión monetaria
 * - Factores y montos separados por tipo (finiquito/liquidación/complemento)
 * - ISR y deducciones manuales
 * - Totales agregados por sección y total final
 *
 * @param calculation - Resultado del cálculo completo de finiquito
 * @returns Objeto con campos compatibles con Prisma.finiquito.create()
 * @see /apps/dashboard/lib/finiquitos/calculate-finiquito-complete.ts
 * @see /apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx - Usa estos mismos campos
 */
export function mapCalculationToPrisma(calculation: CalculateFiniquitoOutput) {
  return {
    // ===== ISR =====
    isrFiniquito: new Decimal(calculation.isr.isrFiniquito),
    isrArt174: new Decimal(calculation.isr.isrArt174),
    isrIndemnizacion: new Decimal(calculation.isr.isrIndemnizacion),

    // ===== DEDUCCIONES MANUALES =====
    montoDeduccionInfonavit: new Decimal(calculation.deducciones.infonavit),
    montoDeduccionFonacot: new Decimal(calculation.deducciones.fonacot),
    montoDeduccionOtrasDeducciones: new Decimal(calculation.deducciones.otras),
    montoDeduccionSubsidio: new Decimal(calculation.deducciones.subsidio),

    // ===== FINIQUITO - FACTORES =====
    factorDiasTrabajadosFiniquito: new Decimal(calculation.factores.finiquito.diasTrabajados),
    factorSeptimoDiaFiniquito: new Decimal(calculation.factores.finiquito.septimoDia),
    factorVacacionesFiniquito: new Decimal(calculation.factores.finiquito.vacaciones),
    factorPrimaVacacionalFiniquito: new Decimal(calculation.factores.finiquito.primaVacacional),
    factorAguinaldoFiniquito: new Decimal(calculation.factores.finiquito.aguinaldo),

    // ===== FINIQUITO - MONTOS =====
    montoDiasTrabajadosFiniquito: new Decimal(calculation.montos.finiquito.diasTrabajados.totalAmount),
    montoSeptimoDiaFiniquito: new Decimal(calculation.montos.finiquito.septimoDia.totalAmount),
    montoVacacionesFiniquito: new Decimal(calculation.montos.finiquito.vacaciones.totalAmount),
    montoPrimaVacacionalFiniquito: new Decimal(calculation.montos.finiquito.primaVacacional.totalAmount),
    montoAguinaldoFiniquito: new Decimal(calculation.montos.finiquito.aguinaldo.totalAmount),

    // ===== LIQUIDACIÓN - FACTORES (opcional) =====
    ...(calculation.factores.liquidacion && {
      factorIndemnizacion90Dias: new Decimal(calculation.factores.liquidacion.indemnizacion90Dias),
      factorIndemnizacion20Dias: new Decimal(calculation.factores.liquidacion.indemnizacion20Dias),
      factorPrimaAntiguedad: new Decimal(calculation.factores.liquidacion.primaAntiguedad),
    }),

    // ===== LIQUIDACIÓN - MONTOS (opcional) =====
    ...(calculation.montos.liquidacion && {
      montoIndemnizacion90Dias: new Decimal(calculation.montos.liquidacion.indemnizacion90Dias.totalAmount),
      montoIndemnizacion20Dias: new Decimal(calculation.montos.liquidacion.indemnizacion20Dias.totalAmount),
      montoPrimaAntiguedad: new Decimal(calculation.montos.liquidacion.primaAntiguedad.totalAmount),
    }),

    // ===== COMPLEMENTO - FACTORES (opcional) =====
    ...(calculation.factores.complemento && {
      factorDiasTrabajadosComplemento: new Decimal(calculation.factores.complemento.diasTrabajados),
      factorSeptimoDiaComplemento: new Decimal(calculation.factores.complemento.septimoDia),
      factorVacacionesComplemento: new Decimal(calculation.factores.complemento.vacaciones),
      factorPrimaVacacionalComplemento: new Decimal(calculation.factores.complemento.primaVacacional),
      factorAguinaldoComplemento: new Decimal(calculation.factores.complemento.aguinaldo),
    }),

    // ===== COMPLEMENTO - MONTOS (opcional) =====
    ...(calculation.montos.complemento && {
      montoDiasTrabajadosComplemento: new Decimal(calculation.montos.complemento.diasTrabajados.totalAmount),
      montoSeptimoDiaComplemento: new Decimal(calculation.montos.complemento.septimoDia.totalAmount),
      montoVacacionesComplemento: new Decimal(calculation.montos.complemento.vacaciones.totalAmount),
      montoPrimaVacacionalComplemento: new Decimal(calculation.montos.complemento.primaVacacional.totalAmount),
      montoAguinaldoComplemento: new Decimal(calculation.montos.complemento.aguinaldo.totalAmount),
    }),

    // ===== TOTALES - FINIQUITO =====
    totalPercepcionesFiniquito: new Decimal(calculation.totales.finiquito.percepciones),
    totalDeduccionesFiniquito: new Decimal(calculation.totales.finiquito.deducciones),
    totalFiniquito: new Decimal(calculation.totales.finiquito.neto),

    // ===== TOTALES - LIQUIDACIÓN (opcional) =====
    ...(calculation.totales.liquidacion && {
      totalPercepcionesLiquidacion: new Decimal(calculation.totales.liquidacion.percepciones),
      totalDeduccionesLiquidacion: new Decimal(calculation.totales.liquidacion.deducciones),
      totalLiquidacion: new Decimal(calculation.totales.liquidacion.neto),
    }),

    // ===== TOTALES - COMPLEMENTO (opcional) =====
    ...(calculation.totales.complemento && {
      totalPercepcionesComplemento: new Decimal(calculation.totales.complemento.percepciones),
      totalDeduccionesComplemento: new Decimal(calculation.totales.complemento.deducciones),
      totalComplemento: new Decimal(calculation.totales.complemento.neto),
    }),

    // ===== TOTAL FINAL =====
    totalAPagar: new Decimal(calculation.totales.totalAPagar),

    // ===== METADATA =====
    daysWorked: calculation.metadata.daysWorked,
    yearsWorked: new Decimal(calculation.metadata.yearsWorked),
    daysFactor: new Decimal(calculation.metadata.daysFactor),
  };
}

/**
 * Servicio Orquestador de Cálculo de Finiquito
 *
 * Este servicio integra la calculadora de factores y la calculadora de finiquitos
 * para producir un resultado completo con factores, montos, ISR, deducciones y totales.
 *
 * Flujo:
 * 1. Llamar calculadora de factores (TerminationProportionalService)
 * 2. Calcular factores adicionales (diasTrabajados, septimoDia)
 * 3. Llamar calculadora de finiquitos (ImplementationV1)
 * 4. Mapear resultado a output estructurado
 */

import { BorderZone } from '@workspace/database';
import { DefaultTerminationProportionalImpl } from './calculadora-factores/implementation';
import { ImplementationV1 } from './calculadora-finiquitos/implementation';
import { ISRCalculatorImpl } from './calculadora-isr/implementation';
import {
  TerminationProportionalRequest,
  BenefitByLawConfiguration
} from './calculadora-factores/models';
import {
  ConfiguracionCalculoFiniquitoLiquidacion,
  ConceptosFiniquito,
  ConceptosLiquidacion,
  FactoresCalculoFiniquitoLiquidacion,
  PayrollSettings,
  PayrollConstants,
  ISRRates
} from './calculadora-finiquitos/models';
import {
  CalculateFiniquitoInput,
  CalculateFiniquitoOutput,
  PerceptionDetail
} from './types/calculate-finiquito-types';
import {
  calculateDaysWorked,
  calculateYearsWorked,
  round
} from './utils';
import { DECIMAL_PRECISION, MINIMUM_SALARIES } from './constants';

// Constantes 2025
const UMA_2025 = 113.14;
const ISR_RATES_2025: ISRRates = {
  effectiveDate: new Date('2025-01-01'),
  rangeValues: [
    { lowerLimit: 0.01, upperLimit: 7735.00, fixedFee: 0.00, percentageOverSurplus: 1.92 },
    { lowerLimit: 7735.01, upperLimit: 65651.07, fixedFee: 148.51, percentageOverSurplus: 6.40 },
    { lowerLimit: 65651.08, upperLimit: 115375.90, fixedFee: 3855.14, percentageOverSurplus: 10.88 },
    { lowerLimit: 115375.91, upperLimit: 134119.41, fixedFee: 9265.20, percentageOverSurplus: 16.00 },
    { lowerLimit: 134119.42, upperLimit: 160577.65, fixedFee: 12264.16, percentageOverSurplus: 17.92 },
    { lowerLimit: 160577.66, upperLimit: 323862.00, fixedFee: 17005.47, percentageOverSurplus: 21.36 },
    { lowerLimit: 323862.01, upperLimit: 510451.00, fixedFee: 51883.01, percentageOverSurplus: 23.52 },
    { lowerLimit: 510451.01, upperLimit: 974535.03, fixedFee: 95768.74, percentageOverSurplus: 30.00 },
    { lowerLimit: 974535.04, upperLimit: 1299380.04, fixedFee: 234993.95, percentageOverSurplus: 32.00 },
    { lowerLimit: 1299380.05, upperLimit: 3898140.12, fixedFee: 338944.34, percentageOverSurplus: 34.00 },
    { lowerLimit: 3898140.13, upperLimit: 999999999.99, fixedFee: 1222522.76, percentageOverSurplus: 35.00 },
  ]
};

// Configuración por defecto de PayrollSettings
const DEFAULT_PAYROLL_SETTINGS: PayrollSettings = {
  calculationSettings: {
    calculationUsingCalendarDays: true,
    isInfonavitLimitDisabled: false,
    calculateISROnMinWage: false,
    pendingBalance: {
      enableInfonavit: false,
      enableFonacot: false,
    },
    infonavit: {
      enableSeguroVivienda: false,
      cuotaFijaCalculationMethod: 'default',
    },
  },
  weeklyRestDay: 0, // Domingo
};

// PayrollConstants por defecto
const DEFAULT_PAYROLL_CONSTANTS: PayrollConstants = {
  minimumSalaryValues: [
    {
      effectiveDate: '2025-01-01',
      generalSalary: MINIMUM_SALARIES[BorderZone.NO_FRONTERIZA],
      borderZoneSalary: MINIMUM_SALARIES[BorderZone.FRONTERIZA],
    }
  ],
  umaValues: [{ effectiveDate: new Date('2025-01-01'), value: UMA_2025 }],
  umiValues: [{ effectiveDate: new Date('2025-01-01'), value: 100.81 }],
  isnValues: [],
  socialCostFees: [],
  cesantiaVejezFees: [],
  laborRiskPremiums: [],
  isrRates: [ISR_RATES_2025],
};

/**
 * Calcula un finiquito completo integrando ambas calculadoras
 */
export function calculateFiniquitoComplete(
  input: CalculateFiniquitoInput
): CalculateFiniquitoOutput {
  // ===== PASO 1: CALCULAR FACTORES CON CALCULADORA DE FACTORES =====

  const benefitConfig: BenefitByLawConfiguration = {
    primaVacacional: input.vacationPremiumPercentage,
    aguinaldo: input.aguinaldoDays,
  };

  const inputFactores: TerminationProportionalRequest = {
    calculations: [{
      employeeId: input.employeeId || 'temp',
      isSeveranceCalculationEnabled: input.liquidacion?.enabled || false,
      fiscal: {
        entryDate: input.hireDate.toISOString(),
        calculationDate: input.terminationDate.toISOString(),
        dailySalary: input.fiscalDailySalary,
        integratedDailySalary: input.integratedDailySalary,
        pendingVacations: input.pendingVacationDays,
        pendingVacationBonus: input.pendingVacationPremium,
      },
      complement: input.complemento?.enabled ? {
        entryDate: input.complemento.realHireDate.toISOString(),
        calculationDate: input.terminationDate.toISOString(),
        dailySalary: input.complemento.realDailySalary,
        pendingVacations: input.complemento.pendingVacationDays,
        pendingVacationBonus: input.complemento.pendingVacationPremium,
      } : undefined,
      benefitByLawConfiguration: benefitConfig,
    }]
  };

  const service = new DefaultTerminationProportionalImpl();
  const response = service.calculateProportionals(inputFactores);
  const resultFactores = response.results[0];

  if (!resultFactores || resultFactores.status !== 'success') {
    throw new Error('Error al calcular factores proporcionales');
  }

  // ===== PASO 2: CALCULAR FACTORES ADICIONALES =====

  const diasTrabajados = calculateDaysWorked(input.hireDate, input.terminationDate);
  const septimoDia = round(diasTrabajados / 7, DECIMAL_PRECISION.FACTOR);

  // ===== PASO 3: PREPARAR INPUT PARA CALCULADORA DE FINIQUITOS =====

  const conceptosFiniquito: ConceptosFiniquito = {
    diasTrabajados: diasTrabajados,
    septimoDia: septimoDia,
    vacaciones: resultFactores.fiscal.proportionalSettlementConcepts.vacations,
    vacacionesPendientes: resultFactores.fiscal.proportionalSettlementConcepts.pendingVacations || 0,
    primaVacacional: resultFactores.fiscal.proportionalSettlementConcepts.vacationBonus,
    primaVacacionalPendiente: resultFactores.fiscal.proportionalSettlementConcepts.pendingVacationBonus || 0,
    aguinaldo: resultFactores.fiscal.proportionalSettlementConcepts.christmasBonus,
    diasRetroactivosSueldo: 0, // No lo usamos
  };

  const conceptosLiquidacion: ConceptosLiquidacion | undefined = input.liquidacion?.enabled ? {
    indemnizacionVeinteDias: resultFactores.fiscal.proportionalSeveranceConcepts?.twentyDaysSeverance || 0,
    indemnizacionNoventaDias: resultFactores.fiscal.proportionalSeveranceConcepts?.ninetyDaysSeverance || 0,
    primaAntiguedad: resultFactores.fiscal.proportionalSeveranceConcepts?.seniorityBonus || 0,
  } : undefined;

  const factoresCalculo: FactoresCalculoFiniquitoLiquidacion = {
    salarioDiario: input.fiscalDailySalary,
    salarioDiarioIntegrado: input.integratedDailySalary,
    antiguedad: {
      anios: resultFactores.fiscal.seniority.years,
      dias: resultFactores.fiscal.seniority.days,
      factor: resultFactores.fiscal.seniority.factor,
    },
    conceptosFiniquito,
    conceptosLiquidacion: conceptosLiquidacion || { indemnizacionVeinteDias: 0, indemnizacionNoventaDias: 0, primaAntiguedad: 0 },
    otrasPercepciones: [],
    otrasDeducciones: [
      ...(input.deduccionesManuales?.infonavit ? [{
        id: 'infonavit',
        conceptoVisual: 'Infonavit',
        conceptoFacturacion: 'Infonavit',
        monto: input.deduccionesManuales.infonavit,
      }] : []),
      ...(input.deduccionesManuales?.fonacot ? [{
        id: 'fonacot',
        conceptoVisual: 'Fonacot',
        conceptoFacturacion: 'Fonacot',
        monto: input.deduccionesManuales.fonacot,
      }] : []),
      ...(input.deduccionesManuales?.otras ? [{
        id: 'otras',
        conceptoVisual: 'Otras Deducciones',
        conceptoFacturacion: 'Otras Deducciones',
        monto: input.deduccionesManuales.otras,
      }] : []),
      ...(input.deduccionesManuales?.subsidio ? [{
        id: 'subsidio',
        conceptoVisual: 'Subsidio',
        conceptoFacturacion: 'Subsidio',
        monto: input.deduccionesManuales.subsidio,
      }] : []),
    ],
  };

  // Factores de complemento si está activado
  let factoresComplemento: FactoresCalculoFiniquitoLiquidacion | undefined;
  if (input.complemento?.enabled && resultFactores.complement) {
    const diasTrabajadosComplemento = calculateDaysWorked(input.complemento.realHireDate, input.terminationDate);
    const septimoDiaComplemento = round(diasTrabajadosComplemento / 7, DECIMAL_PRECISION.FACTOR);

    const conceptosFiniquitoComplemento: ConceptosFiniquito = {
      diasTrabajados: diasTrabajadosComplemento,
      septimoDia: septimoDiaComplemento,
      vacaciones: resultFactores.complement.proportionalSettlementConcepts.vacations,
      vacacionesPendientes: resultFactores.complement.proportionalSettlementConcepts.pendingVacations || 0,
      primaVacacional: resultFactores.complement.proportionalSettlementConcepts.vacationBonus,
      primaVacacionalPendiente: resultFactores.complement.proportionalSettlementConcepts.pendingVacationBonus || 0,
      aguinaldo: resultFactores.complement.proportionalSettlementConcepts.christmasBonus,
      diasRetroactivosSueldo: 0,
    };

    const conceptosLiquidacionComplemento: ConceptosLiquidacion | undefined = input.liquidacion?.enabled && resultFactores.complement.proportionalSeveranceConcepts ? {
      indemnizacionVeinteDias: resultFactores.complement.proportionalSeveranceConcepts.twentyDaysSeverance,
      indemnizacionNoventaDias: resultFactores.complement.proportionalSeveranceConcepts.ninetyDaysSeverance,
      primaAntiguedad: resultFactores.complement.proportionalSeveranceConcepts.seniorityBonus,
    } : undefined;

    factoresComplemento = {
      salarioDiario: input.complemento.realDailySalary,
      salarioDiarioIntegrado: input.integratedDailySalary, // Usar el mismo SDI
      antiguedad: {
        anios: resultFactores.complement.seniority.years,
        dias: resultFactores.complement.seniority.days,
        factor: resultFactores.complement.seniority.factor,
      },
      conceptosFiniquito: conceptosFiniquitoComplemento,
      conceptosLiquidacion: conceptosLiquidacionComplemento || { indemnizacionVeinteDias: 0, indemnizacionNoventaDias: 0, primaAntiguedad: 0 },
      otrasPercepciones: [],
      otrasDeducciones: [], // Deducciones solo en fiscal
    };
  }

  const config: ConfiguracionCalculoFiniquitoLiquidacion = {
    payrollSettings: DEFAULT_PAYROLL_SETTINGS,
    payrollConstants: DEFAULT_PAYROLL_CONSTANTS,
    factoresCalculo,
    factoresComplemento,
    acumuladoPercepciones: [],
    benefitByLawConfiguration: benefitConfig,
  };

  const isrCalculator = new ISRCalculatorImpl();
  const calculadoraFiniquito = new ImplementationV1(isrCalculator);
  const resultCalculation = calculadoraFiniquito.calcular(config);

  if (!resultCalculation) {
    throw new Error('Error al calcular finiquito');
  }

  // ===== PASO 4: MAPEAR RESULTADO A OUTPUT =====

  const output: CalculateFiniquitoOutput = {
    factores: {
      finiquito: {
        diasTrabajados: conceptosFiniquito.diasTrabajados,
        septimoDia: conceptosFiniquito.septimoDia,
        vacaciones: conceptosFiniquito.vacaciones,
        primaVacacional: conceptosFiniquito.primaVacacional,
        aguinaldo: conceptosFiniquito.aguinaldo,
      },
      liquidacion: conceptosLiquidacion ? {
        indemnizacion90Dias: conceptosLiquidacion.indemnizacionNoventaDias,
        indemnizacion20Dias: conceptosLiquidacion.indemnizacionVeinteDias,
        primaAntiguedad: conceptosLiquidacion.primaAntiguedad,
      } : undefined,
      complemento: factoresComplemento ? {
        diasTrabajados: factoresComplemento.conceptosFiniquito.diasTrabajados,
        septimoDia: factoresComplemento.conceptosFiniquito.septimoDia,
        vacaciones: factoresComplemento.conceptosFiniquito.vacaciones,
        primaVacacional: factoresComplemento.conceptosFiniquito.primaVacacional,
        aguinaldo: factoresComplemento.conceptosFiniquito.aguinaldo,
      } : undefined,
    },

    montos: {
      finiquito: {
        diasTrabajados: mapPercept(resultCalculation.percepcionesFiniquito.diasTrabajados),
        septimoDia: mapPercept(resultCalculation.percepcionesFiniquito.septimoDia),
        vacaciones: mapPercept(resultCalculation.percepcionesFiniquito.vacaciones),
        primaVacacional: mapPercept(resultCalculation.percepcionesFiniquito.primaVacacional),
        aguinaldo: mapPercept(resultCalculation.percepcionesFiniquito.aguinaldo),
      },
      liquidacion: conceptosLiquidacion ? {
        indemnizacion90Dias: mapPercept(resultCalculation.percepcionesLiquidacion.indemnizacionNoventaDias),
        indemnizacion20Dias: mapPercept(resultCalculation.percepcionesLiquidacion.indemnizacionVeinteDias),
        primaAntiguedad: mapPercept(resultCalculation.percepcionesLiquidacion.primaAntiguedad),
      } : undefined,
      complemento: resultCalculation.percepcionesFiniquitoComplemento ? {
        diasTrabajados: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.diasTrabajados),
        septimoDia: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.septimoDia),
        vacaciones: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.vacaciones),
        primaVacacional: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.primaVacacional),
        aguinaldo: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.aguinaldo),
      } : undefined,
    },

    isr: {
      isrFiniquito: resultCalculation.calculoISR.isrFiniquito.totalImpuesto,
      isrArt174: resultCalculation.calculoISR.isrArt174?.totalImpuesto || 0,
      isrIndemnizacion: resultCalculation.calculoISR.isrIndemnizacion.totalImpuesto,
    },

    deducciones: {
      isrTotal: (resultCalculation.calculoISR.isrFiniquito.totalImpuesto || 0) +
                (resultCalculation.calculoISR.isrArt174?.totalImpuesto || 0) +
                (resultCalculation.calculoISR.isrIndemnizacion.totalImpuesto || 0),
      infonavit: input.deduccionesManuales?.infonavit || 0,
      fonacot: input.deduccionesManuales?.fonacot || 0,
      otras: input.deduccionesManuales?.otras || 0,
      subsidio: input.deduccionesManuales?.subsidio || 0,
      total: resultCalculation.finiquito.totalDeduccionesFiscal + resultCalculation.liquidacion.totalDeduccionesFiscal,
    },

    totales: {
      finiquito: {
        percepciones: resultCalculation.finiquito.totalPercepcionesFiscal,
        deducciones: resultCalculation.finiquito.totalDeduccionesFiscal,
        neto: resultCalculation.finiquito.neto,
      },
      liquidacion: conceptosLiquidacion ? {
        percepciones: resultCalculation.liquidacion.totalPercepcionesFiscal,
        deducciones: resultCalculation.liquidacion.totalDeduccionesFiscal,
        neto: resultCalculation.liquidacion.neto,
      } : undefined,
      complemento: resultCalculation.percepcionesFiniquitoComplemento ? {
        percepciones: resultCalculation.totalPercepcionesComplemento || 0,
        deducciones: resultCalculation.totalDeduccionesComplemento || 0,
        neto: resultCalculation.complementoNeto || 0,
      } : undefined,
      totalAPagar: resultCalculation.finiquito.neto +
                   resultCalculation.liquidacion.neto +
                   (resultCalculation.complementoNeto || 0),
    },

    metadata: {
      daysWorked: diasTrabajados,
      yearsWorked: calculateYearsWorked(diasTrabajados),
      daysFactor: 30.4,
    },
  };

  return output;
}

/**
 * Helper para mapear Perception a PerceptionDetail
 */
function mapPercept(p: any): PerceptionDetail {
  return {
    totalAmount: p.totalAmount || 0,
    totalTaxBase: p.totalTaxBase || 0,
    totalExemptBase: p.totalExemptBase || 0,
    totalQuantity: p.totalQuantity || 0,
  };
}

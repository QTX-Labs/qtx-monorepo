/**
 * Servicio Orquestador de Cálculo de Finiquito
 *
 * Este servicio integra la calculadora de factores y la calculadora de finiquitos
 * para producir un resultado completo con factores, montos, ISR, deducciones y totales.
 *
 * FLUJO PRINCIPAL:
 * 1. Llamar calculadora de factores (DefaultTerminationProportionalImpl)
 *    - Calcula factores proporcionales: vacaciones, prima vacacional, aguinaldo
 *    - Calcula liquidación si está habilitada: indemnización 90/20 días, prima antigüedad
 *    - Calcula complemento si está habilitado (diferencia salario real vs fiscal)
 * 2. Merge con factores manuales (del Step 2 del wizard, si existen)
 *    - Los factores manuales sobrescriben los calculados
 * 3. Llamar calculadora de finiquitos (ImplementationV1)
 *    - Convierte factores (días) a montos (pesos)
 *    - Calcula ISR (impuestos)
 *    - Aplica deducciones manuales
 * 4. Mapear resultado a output estructurado
 *    - Organiza en: factores, montos, isr, deducciones, totales
 *
 * IMPORTANTE - PRIMA VACACIONAL (FACTOR vs VALUE):
 * La prima vacacional requiere manejo especial para evitar doble aplicación del porcentaje:
 *
 * - En Step2Factors.primaVacacional:
 *   Almacenado como FACTOR (ej: 0.24 para 24%)
 *   Este es el valor que se muestra al usuario para edición
 *
 * - En ConceptosFiniquito.primaVacacional:
 *   Almacenado como DÍAS DE VACACIONES (ej: 1.0 día)
 *   La función calcularPrimaVacacional() aplica el porcentaje (25%)
 *   Resultado: 1.0 × 25% = 0.25 días de prima vacacional
 *
 * - En Output.factores.primaVacacional:
 *   Se regresa el FACTOR original (0.24) para visualización
 *   Esto permite que el usuario vea el valor correcto en Step 2
 *
 * Ver líneas 273-276 y 344 para la implementación específica.
 * Sin esta distinción, el porcentaje se aplicaría dos veces: una en la calculadora
 * de factores y otra en calcularPrimaVacacional, resultando en valores incorrectos.
 *
 * CASOS DE USO:
 * 1. Step 1 → Step 2: auto-población de factores iniciales
 * 2. Live calculation: actualización en tiempo real al editar Step 2/3
 * 3. Step 4: cálculo final antes de crear el finiquito en BD
 *
 * RELATED:
 * - See /apps/dashboard/components/organizations/slug/finiquitos/create/steps/step1-base-config.tsx for initial call
 * - See /apps/dashboard/components/organizations/slug/finiquitos/create/hooks/use-live-calculation.ts for live updates
 * - See /apps/dashboard/lib/finiquitos/calculadora-finiquitos/implementation.ts for monetary calculation
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
  ISRRates,
  Perception
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
import { DECIMAL_PRECISION } from './constants';

// ===== CONSTANTES DE PAYROLL 2024-2025 =====

// Tabla ISR 2024 (Mensual)
const ISR_RATES_2024: ISRRates = {
  effectiveDate: new Date('2024-01-01'),
  rangeValues: [
    { lowerLimit: 0.01, upperLimit: 746.04, fixedFee: 0.00, percentageOverSurplus: 1.92 },
    { lowerLimit: 746.05, upperLimit: 6332.05, fixedFee: 14.32, percentageOverSurplus: 6.40 },
    { lowerLimit: 6332.06, upperLimit: 11128.01, fixedFee: 371.83, percentageOverSurplus: 10.88 },
    { lowerLimit: 11128.02, upperLimit: 12935.82, fixedFee: 893.63, percentageOverSurplus: 16.00 },
    { lowerLimit: 12935.83, upperLimit: 15487.71, fixedFee: 1182.88, percentageOverSurplus: 17.92 },
    { lowerLimit: 15487.72, upperLimit: 31236.49, fixedFee: 1640.18, percentageOverSurplus: 21.36 },
    { lowerLimit: 31236.50, upperLimit: 49233.00, fixedFee: 5004.12, percentageOverSurplus: 23.52 },
    { lowerLimit: 49233.01, upperLimit: 93993.90, fixedFee: 9236.89, percentageOverSurplus: 30.00 },
    { lowerLimit: 93993.91, upperLimit: 125325.20, fixedFee: 22665.17, percentageOverSurplus: 32.00 },
    { lowerLimit: 125325.21, upperLimit: 375975.61, fixedFee: 32691.18, percentageOverSurplus: 34.00 },
    { lowerLimit: 375975.62, upperLimit: 0, fixedFee: 117912.32, percentageOverSurplus: 35.00 },
  ]
};

// Valores UMA históricos
const UMA_VALUES = [
  { value: 103.74, effectiveDate: new Date('2024-01-01') },
  { value: 108.57, effectiveDate: new Date('2024-02-01') },
  { value: 113.14, effectiveDate: new Date('2025-02-01') },
];

// Valores UMI históricos
const UMI_VALUES = [
  { value: 96.32, effectiveDate: new Date('2024-01-01') },
  { value: 100.81, effectiveDate: new Date('2024-02-01') },
];

// Valores ISN
const ISN_VALUES = [
  { value: 1.8, effectiveDate: new Date('2024-01-01T00:00:00.000Z') },
];

// Cuotas IMSS 2024
const SOCIAL_COST_FEES_2024 = {
  effectiveDate: new Date('2024-01-01'),
  retiro: {
    umasLimit: 25,
    workersPercentage: 0,
    employersPercentage: 2,
  },
  infonavit: {
    umasLimit: 25,
    workersPercentage: 0,
    employersPercentage: 5,
  },
  cesantiaYVejez: {
    umasLimit: 25,
    workersPercentage: 1.125,
    employersPercentage: 0,
  },
  invalidezYVida: {
    umasLimit: 25,
    workersPercentage: 0.625,
    employersPercentage: 1.75,
  },
  enfermedadesYMaternidad: {
    dinero: {
      umasLimit: 25,
      workersPercentage: 0.25,
      employersPercentage: 0.7,
    },
    cuotaFija: {
      umasLimit: 25,
      workersPercentage: 0,
      employersPercentage: 20.4,
    },
    gastosMedicos: {
      umasLimit: 25,
      workersPercentage: 0.375,
      employersPercentage: 1.05,
    },
    cuotaAdicional: {
      umasLimit: 3,
      workersPercentage: 0.4,
      employersPercentage: 1.1,
    },
  },
  guarderiasYPrestacionesSociales: {
    umasLimit: 25,
    workersPercentage: 0,
    employersPercentage: 1,
  },
};

// Cesantía y Vejez 2024
const CESANTIA_VEJEZ_FEES_2024 = {
  effectiveDate: new Date('2024-01-01'),
  rangeValues: [
    { lowerLimit: 0, upperLimit: 1, percentage: 3.15 },
    { lowerLimit: 1.01, upperLimit: 1.5, percentage: 3.413 },
    { lowerLimit: 1.51, upperLimit: 2.15, percentage: 4 },
    { lowerLimit: 2.16, upperLimit: 2.5, percentage: 4.353 },
    { lowerLimit: 2.51, upperLimit: 3, percentage: 4.588 },
    { lowerLimit: 3.01, upperLimit: 3.5, percentage: 4.756 },
    { lowerLimit: 3.51, upperLimit: 4, percentage: 4.882 },
    { lowerLimit: 4.01, upperLimit: 0, percentage: 5.331 },
  ],
};

// Cesantía y Vejez 2025
const CESANTIA_VEJEZ_FEES_2025 = {
  effectiveDate: new Date('2025-01-01'),
  rangeValues: [
    { lowerLimit: 0, upperLimit: 1, percentage: 3.15 },
    { lowerLimit: 1.01, upperLimit: 1.5, percentage: 3.544 },
    { lowerLimit: 1.51, upperLimit: 2.15, percentage: 4.426 },
    { lowerLimit: 2.16, upperLimit: 2.5, percentage: 4.954 },
    { lowerLimit: 2.51, upperLimit: 3, percentage: 5.307 },
    { lowerLimit: 3.01, upperLimit: 3.5, percentage: 5.559 },
    { lowerLimit: 3.51, upperLimit: 4, percentage: 5.747 },
    { lowerLimit: 4.01, upperLimit: 0, percentage: 6.422 },
  ],
};

// Prima de Riesgo de Trabajo 2025
const LABOR_RISK_PREMIUM_2025 = {
  percentage: 1.65325,
  effectiveDate: new Date('2025-03-01T00:00:00.000Z'),
};

// Salarios Mínimos
const MINIMUM_SALARY_VALUES = [
  {
    effectiveDate: '2024-01-01T06:00:00.000Z',
    generalSalary: 248.93,
    borderZoneSalary: 374.89,
  },
  {
    effectiveDate: '2025-01-01T06:00:00.000Z',
    generalSalary: 278.8,
    borderZoneSalary: 419.88,
  },
];

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
  isrRates: [ISR_RATES_2024],
  isnValues: ISN_VALUES,
  umaValues: UMA_VALUES,
  umiValues: UMI_VALUES,
  socialCostFees: [SOCIAL_COST_FEES_2024],
  cesantiaVejezFees: [CESANTIA_VEJEZ_FEES_2024, CESANTIA_VEJEZ_FEES_2025],
  laborRiskPremiums: [LABOR_RISK_PREMIUM_2025],
  minimumSalaryValues: MINIMUM_SALARY_VALUES,
}

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


  // Sobrescribir con factores manuales si existen (del Step 2)
  const diasTrabajados = input.manualFactors?.finiquito?.diasTrabajados ?? 0;
  const septimoDia = input.manualFactors?.finiquito?.septimoDia ?? 0;
  const vacaciones = input.manualFactors?.finiquito?.vacaciones ?? resultFactores.fiscal.proportionalSettlementConcepts.vacations;

  // IMPORTANTE: primaVacacionalFactor es el porcentaje ya calculado (ej: 0.24 para 24%)
  // Este valor se guardará en output.factores.primaVacacional para visualización en Step 2
  // Pero NO se usa directamente en conceptosFiniquito (ver línea 314)
  const primaVacacionalFactor = input.manualFactors?.finiquito?.primaVacacional ?? resultFactores.fiscal.proportionalSettlementConcepts.vacationBonus;

  const aguinaldo = input.manualFactors?.finiquito?.aguinaldo ?? resultFactores.fiscal.proportionalSettlementConcepts.christmasBonus;

  // ===== PASO 3: PREPARAR INPUT PARA CALCULADORA DE FINIQUITOS =====

  const conceptosFiniquito: ConceptosFiniquito = {
    diasTrabajados: diasTrabajados,
    septimoDia: septimoDia,
    vacaciones: vacaciones,
    vacacionesPendientes: resultFactores.fiscal.proportionalSettlementConcepts.pendingVacations || 0,
    // CRÍTICO: primaVacacional en ConceptosFiniquito debe ser DÍAS DE VACACIONES, NO el factor
    // La función calcularPrimaVacacional() en ImplementationV1 aplicará el porcentaje (25%)
    // Si pasamos el factor aquí, el porcentaje se aplicaría dos veces
    // Ejemplo: vacaciones = 1.0 día → calcularPrimaVacacional aplica 25% → 0.25 días de prima
    primaVacacional: vacaciones,
    primaVacacionalPendiente: resultFactores.fiscal.proportionalSettlementConcepts.pendingVacationBonus || 0,
    aguinaldo: aguinaldo,
    diasRetroactivosSueldo: 0, // No lo usamos
  };

  const conceptosLiquidacion: ConceptosLiquidacion | undefined = input.liquidacion?.enabled ? {
    indemnizacionVeinteDias: input.manualFactors?.liquidacion?.indemnizacion20Dias ?? (resultFactores.fiscal.proportionalSeveranceConcepts?.twentyDaysSeverance || 0),
    indemnizacionNoventaDias: input.manualFactors?.liquidacion?.indemnizacion90Dias ?? (resultFactores.fiscal.proportionalSeveranceConcepts?.ninetyDaysSeverance || 0),
    primaAntiguedad: input.manualFactors?.liquidacion?.primaAntiguedad ?? (resultFactores.fiscal.proportionalSeveranceConcepts?.seniorityBonus || 0),
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
    otrasPercepciones: [
      ...(input.manualFactors?.configuracionAdicional?.gratificacionPesos ? [{
        id: 'gratificacion',
        conceptoVisual: 'Gratificación',
        conceptoFacturacion: 'Gratificación',
        monto: input.manualFactors.configuracionAdicional.gratificacionPesos,
      }] : []),
    ],
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
  let primaVacacionalComplementoFactor = 0;

  if (input.complemento?.enabled && resultFactores.complement) {

    // Sobrescribir con factores manuales si existen (del Step 2)
    const diasTrabajadosComplemento = input.manualFactors?.complemento?.diasTrabajados ?? 0;
    const septimoDiaComplemento = input.manualFactors?.complemento?.septimoDia ?? 0;
    const vacacionesComplemento = input.manualFactors?.complemento?.vacaciones ?? resultFactores.complement.proportionalSettlementConcepts.vacations;
    primaVacacionalComplementoFactor = input.manualFactors?.complemento?.primaVacacional ?? resultFactores.complement.proportionalSettlementConcepts.vacationBonus;
    const aguinaldoComplemento = input.manualFactors?.complemento?.aguinaldo ?? resultFactores.complement.proportionalSettlementConcepts.christmasBonus;

    const conceptosFiniquitoComplemento: ConceptosFiniquito = {
      diasTrabajados: diasTrabajadosComplemento,
      septimoDia: septimoDiaComplemento,
      vacaciones: vacacionesComplemento,
      vacacionesPendientes: resultFactores.complement.proportionalSettlementConcepts.pendingVacations || 0,
      // NOTA: primaVacacional en ConceptosFiniquito debe ser días de vacaciones, no el factor ya calculado
      primaVacacional: vacacionesComplemento,
      primaVacacionalPendiente: resultFactores.complement.proportionalSettlementConcepts.pendingVacationBonus || 0,
      aguinaldo: aguinaldoComplemento,
      diasRetroactivosSueldo: 0,
    };

    const conceptosLiquidacionComplemento: ConceptosLiquidacion | undefined = input.liquidacion?.enabled && resultFactores.complement.proportionalSeveranceConcepts ? {
      indemnizacionVeinteDias: input.manualFactors?.liquidacionComplemento?.indemnizacion20Dias ?? resultFactores.complement.proportionalSeveranceConcepts.twentyDaysSeverance,
      indemnizacionNoventaDias: input.manualFactors?.liquidacionComplemento?.indemnizacion90Dias ?? resultFactores.complement.proportionalSeveranceConcepts.ninetyDaysSeverance,
      primaAntiguedad: input.manualFactors?.liquidacionComplemento?.primaAntiguedad ?? resultFactores.complement.proportionalSeveranceConcepts.seniorityBonus,
    } : undefined;

    factoresComplemento = {
      salarioDiario: input.complemento.realDailySalary,
      salarioDiarioIntegrado: input.complemento.complementIntegratedDailySalary || input.integratedDailySalary,
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
        primaVacacional: primaVacacionalFactor,
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
        primaVacacional: primaVacacionalComplementoFactor,
        aguinaldo: factoresComplemento.conceptosFiniquito.aguinaldo,
      } : undefined,
      liquidacionComplemento: factoresComplemento?.conceptosLiquidacion ? {
        indemnizacion90Dias: factoresComplemento.conceptosLiquidacion.indemnizacionNoventaDias,
        indemnizacion20Dias: factoresComplemento.conceptosLiquidacion.indemnizacionVeinteDias,
        primaAntiguedad: factoresComplemento.conceptosLiquidacion.primaAntiguedad,
      } : undefined,
      configuracionAdicional: input.manualFactors?.configuracionAdicional,
    },

    montos: {
      finiquito: {
        diasTrabajados: mapPercept(resultCalculation.percepcionesFiniquito.diasTrabajados),
        septimoDia: mapPercept(resultCalculation.percepcionesFiniquito.septimoDia),
        vacaciones: mapPercept(resultCalculation.percepcionesFiniquito.vacaciones),
        vacacionesPendientes: mapPercept(resultCalculation.percepcionesFiniquito.vacacionesPendientes),
        primaVacacional: mapPercept(resultCalculation.percepcionesFiniquito.primaVacacional),
        primaVacacionalPendiente: mapPercept(resultCalculation.percepcionesFiniquito.primaVacacionalPendiente),
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
        vacacionesPendientes: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.vacacionesPendientes),
        primaVacacional: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.primaVacacional),
        primaVacacionalPendiente: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.primaVacacionalPendiente),
        aguinaldo: mapPercept(resultCalculation.percepcionesFiniquitoComplemento.aguinaldo),
      } : undefined,
      liquidacionComplemento: resultCalculation.percepcionesLiquidacionComplemento ? {
        indemnizacion90Dias: mapPercept(resultCalculation.percepcionesLiquidacionComplemento.indemnizacionNoventaDias),
        indemnizacion20Dias: mapPercept(resultCalculation.percepcionesLiquidacionComplemento.indemnizacionVeinteDias),
        primaAntiguedad: mapPercept(resultCalculation.percepcionesLiquidacionComplemento.primaAntiguedad),
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
        neto: resultCalculation.finiquito.netoFiscal,
      },
      liquidacion: conceptosLiquidacion ? {
        percepciones: resultCalculation.liquidacion.totalPercepcionesFiscal,
        deducciones: resultCalculation.liquidacion.totalDeduccionesFiscal,
        neto: resultCalculation.liquidacion.netoFiscal,
      } : undefined,
      liquidacionComplemento: factoresComplemento?.conceptosLiquidacion ? {
        percepciones: resultCalculation.liquidacion.totalPercepciones - resultCalculation.liquidacion.totalPercepcionesFiscal,
        deducciones: resultCalculation.liquidacion.totalDeducciones - resultCalculation.liquidacion.totalDeduccionesFiscal,
        neto: resultCalculation.liquidacion.netoComplemento,
      } : undefined,
      complemento: resultCalculation.percepcionesFiniquitoComplemento ? {
        percepciones: resultCalculation.totalPercepcionesComplemento || 0,
        deducciones: resultCalculation.totalDeduccionesComplemento || 0,
        neto: resultCalculation.complementoNeto || 0,
      } : undefined,
      totalAPagar: resultCalculation.finiquito.netoFiscal +
        resultCalculation.liquidacion.netoFiscal +
        (resultCalculation.liquidacion.netoComplemento || 0) +
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
function mapPercept(p: Perception): PerceptionDetail {
  return {
    totalAmount: p.totalAmount || 0,
    totalTaxBase: p.totalTaxBase || 0,
    totalExemptBase: p.totalExemptBase || 0,
    totalQuantity: p.totalQuantity || 0,
  };
}

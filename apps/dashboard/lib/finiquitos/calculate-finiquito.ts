/**
 * Motor principal de cálculo de finiquitos
 */

import type {
  FiniquitoInput,
  FiniquitoCalculationResult,
  SalaryCalculation,
  CalculationMetadata
} from './types';
import {
  calculateDaysWorked,
  calculateYearsWorked,
  getMinimumSalary,
  calculateRealDailySalary,
  calculateIntegratedDailySalary,
  gratificationDaysToPesos,
  gratificationPesosToDays,
  validateDates,
  validateSalary,
  validateVacationPremium,
  round
} from './utils';
import { calculatePerceptions } from './calculate-perceptions';
import { calculateDeductions, calculateISR } from './calculate-deductions';
import { DEFAULT_DAYS_FACTOR, DEFAULT_PRESTACIONES, DECIMAL_PRECISION } from './constants';

/**
 * Calcula un finiquito completo
 */
export function calculateFiniquito(input: FiniquitoInput): FiniquitoCalculationResult {
  // Validaciones
  validateDates(input.hireDate, input.terminationDate);
  // Solo validar salary si es mayor a 0 (para permitir cálculo fiscal sin complemento)
  if (input.salary > 0) {
    validateSalary(input.salary);
  }

  // Convertir porcentaje entero a decimal (25 -> 0.25)
  const vacationPremiumPercent = input.vacationPremium ?? (DEFAULT_PRESTACIONES.VACATION_PREMIUM * 100);
  const vacationPremium = vacationPremiumPercent / 100;
  validateVacationPremium(vacationPremium);

  // Factor de días
  const daysFactor = input.daysFactor ?? DEFAULT_DAYS_FACTOR;

  // Calcular metadata FISCALES (con fecha de ingreso fiscal)
  const fiscalDaysWorked = calculateDaysWorked(input.hireDate, input.terminationDate);
  const fiscalYearsWorked = calculateYearsWorked(fiscalDaysWorked);

  // Calcular metadata REALES (con fecha de ingreso real si está disponible)
  const realDaysWorked = input.realHireDate
    ? calculateDaysWorked(input.realHireDate, input.terminationDate)
    : fiscalDaysWorked;
  const realYearsWorked = calculateYearsWorked(realDaysWorked);

  // Calcular salarios
  const fiscalDailySalary = input.fiscalDailySalary ?? getMinimumSalary(input.borderZone);
  const realDailySalary = calculateRealDailySalary(
    input.salary,
    input.salaryFrequency,
    daysFactor
  );
  const integratedDailySalary = calculateIntegratedDailySalary(
    fiscalDailySalary,
    input.aguinaldoDays,
    input.vacationDays,
    vacationPremium
  );

  const salaries: SalaryCalculation = {
    fiscalDailySalary,
    realDailySalary,
    integratedDailySalary
  };

  // Manejar gratificación bidireccional
  let gratificationDays = input.gratificationDays;
  let gratificationPesos = input.gratificationPesos;

  // Si se proporcionó días pero no pesos, calcular pesos
  if (gratificationDays && !gratificationPesos) {
    gratificationPesos = gratificationDaysToPesos(gratificationDays, realDailySalary);
  }
  // Si se proporcionó pesos pero no días, calcular días
  else if (gratificationPesos && !gratificationDays) {
    gratificationDays = gratificationPesosToDays(gratificationPesos, realDailySalary);
  }

  // Metadata usa los días fiscales para compatibilidad
  const metadata: CalculationMetadata = {
    daysWorked: fiscalDaysWorked,
    yearsWorked: fiscalYearsWorked,
    daysFactor,
    gratificationDays,
    gratificationPesos
  };

  // Calcular percepciones FISCALES (usa fechas fiscales)
  const fiscalPerceptions = calculatePerceptions({
    daysWorked: fiscalDaysWorked,
    yearsWorked: fiscalYearsWorked,
    dailySalary: fiscalDailySalary,
    aguinaldoDays: input.aguinaldoDays,
    vacationDays: input.vacationDays,
    vacationPremium,
    pendingVacationDays: input.pendingVacationDays,
    pendingVacationPremium: input.pendingVacationPremium,
    workedDays: input.workedDays,
    gratificationAmount: 0, // Gratificación NO va en columna fiscal
    severanceDays: input.severanceDays,
    seniorityPremiumDays: input.seniorityPremiumDays,
    daysFactor
  });

  // Calcular percepciones REALES (usa fechas reales si están disponibles)
  const realPerceptions = calculatePerceptions({
    daysWorked: realDaysWorked,
    yearsWorked: realYearsWorked,
    dailySalary: realDailySalary,
    aguinaldoDays: input.aguinaldoDays,
    vacationDays: input.vacationDays,
    vacationPremium,
    pendingVacationDays: input.pendingVacationDays,
    pendingVacationPremium: input.pendingVacationPremium,
    workedDays: input.workedDays,
    gratificationAmount: gratificationPesos ?? 0, // Gratificación solo en columna REAL
    severanceDays: input.severanceDays,
    seniorityPremiumDays: input.seniorityPremiumDays,
    daysFactor
  });

  // Calcular deducciones FISCALES
  const fiscalISR = input.isrAmount ?? calculateISR(fiscalPerceptions.totalPerceptions);
  const fiscalDeductions = calculateDeductions({
    isr: fiscalISR,
    subsidy: input.subsidyAmount,
    infonavit: input.infonavitAmount,
    fonacot: input.fonacotAmount,
    other: input.otherDeductions
  });

  // Calcular deducciones REALES (generalmente $0)
  const realDeductions = calculateDeductions({
    isr: 0,
    subsidy: 0,
    infonavit: 0,
    fonacot: 0,
    other: 0
  });

  // Calcular netos
  const fiscalNetAmount = round(
    fiscalPerceptions.totalPerceptions - fiscalDeductions.totalDeductions,
    DECIMAL_PRECISION.MONEY
  );
  const realNetAmount = round(
    realPerceptions.totalPerceptions - realDeductions.totalDeductions,
    DECIMAL_PRECISION.MONEY
  );

  // Total a pagar
  const totalToPay = round(fiscalNetAmount + realNetAmount, DECIMAL_PRECISION.MONEY);

  const totals = {
    netPayFiscal: fiscalNetAmount,
    netPayReal: realNetAmount,
    netPayTotal: totalToPay
  };

  return {
    salaries,
    metadata,
    fiscalPerceptions,
    realPerceptions,
    deductions: {
      ...fiscalDeductions,
      totalDeductions: fiscalDeductions.totalDeductions
    },
    totals,
    // Valores calculados legacy para compatibilidad
    fiscalNetAmount,
    realNetAmount,
    totalToPay,
    gratificationDays,
    gratificationPesos
  };
}

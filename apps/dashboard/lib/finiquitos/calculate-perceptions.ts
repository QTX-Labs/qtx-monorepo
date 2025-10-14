/**
 * Cálculo de percepciones para finiquitos
 */

import type { PerceptionsCalculation } from './types';
import {
  calculateAguinaldoFactor,
  calculateVacationFactor,
  calculateVacationPremiumFactor,
  gratificationDaysToPesos,
  calculateSeverance,
  round
} from './utils';
import { DEFAULT_PRESTACIONES, DECIMAL_PRECISION } from './constants';

export interface PerceptionsInput {
  daysWorked: number;
  yearsWorked: number;
  dailySalary: number;
  aguinaldoDays?: number;
  vacationDays?: number;
  vacationPremium?: number;
  pendingVacationDays?: number;
  workedDays?: number;
  gratificationAmount?: number; // Solo para columna REAL
  severanceDays?: number;
  seniorityPremiumDays?: number;
  daysFactor?: number;
}

/**
 * Calcula las percepciones para una columna (Fiscal o Real)
 */
export function calculatePerceptions(input: PerceptionsInput): PerceptionsCalculation {
  const {
    daysWorked,
    yearsWorked,
    dailySalary,
    aguinaldoDays = DEFAULT_PRESTACIONES.AGUINALDO_DAYS,
    vacationDays = DEFAULT_PRESTACIONES.VACATION_DAYS,
    vacationPremium = DEFAULT_PRESTACIONES.VACATION_PREMIUM,
    pendingVacationDays = 0,
    workedDays = 0,
    gratificationAmount = 0,
    severanceDays = 0,
    seniorityPremiumDays = 0,
    daysFactor = 30.4
  } = input;

  // Calcular factores
  const aguinaldoFactor = calculateAguinaldoFactor(daysWorked, aguinaldoDays);
  const vacationFactor = calculateVacationFactor(daysWorked, vacationDays);
  const vacationPremiumFactor = calculateVacationPremiumFactor(
    vacationFactor,
    vacationPremium
  );

  // Calcular montos proporcionales
  const aguinaldoAmount = round(aguinaldoFactor * dailySalary, DECIMAL_PRECISION.MONEY);
  const vacationAmount = round(vacationFactor * dailySalary, DECIMAL_PRECISION.MONEY);
  const vacationPremiumAmount = round(
    vacationPremiumFactor * dailySalary,
    DECIMAL_PRECISION.MONEY
  );

  // Vacaciones pendientes
  const pendingVacationAmount = round(
    pendingVacationDays * dailySalary,
    DECIMAL_PRECISION.MONEY
  );

  // Prima vacacional de días pendientes
  const pendingPremiumAmount = round(
    pendingVacationAmount * vacationPremium,
    DECIMAL_PRECISION.MONEY
  );

  // Días trabajados no pagados en el periodo
  const workedDaysAmount = round(workedDays * dailySalary, DECIMAL_PRECISION.MONEY);

  // Indemnización (días * salario diario)
  const severanceAmount = round(severanceDays * dailySalary, DECIMAL_PRECISION.MONEY);

  // Prima de antigüedad (días * salario diario)
  const seniorityPremiumAmount = round(
    seniorityPremiumDays * dailySalary,
    DECIMAL_PRECISION.MONEY
  );

  // Calcular total de percepciones
  const totalPerceptions = round(
    aguinaldoAmount +
      vacationAmount +
      vacationPremiumAmount +
      pendingVacationAmount +
      pendingPremiumAmount +
      workedDaysAmount +
      gratificationAmount +
      severanceAmount +
      seniorityPremiumAmount,
    DECIMAL_PRECISION.MONEY
  );

  return {
    aguinaldoFactor,
    vacationFactor,
    vacationPremiumFactor,
    aguinaldoAmount,
    vacationAmount,
    vacationPremiumAmount,
    pendingVacationAmount,
    pendingPremiumAmount,
    workedDaysAmount,
    gratificationAmount,
    severanceAmount,
    seniorityPremiumAmount,
    totalPerceptions
  };
}

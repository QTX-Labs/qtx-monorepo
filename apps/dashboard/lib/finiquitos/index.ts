/**
 * Sistema de Cálculo de Finiquitos - ForHuman
 *
 * Motor de cálculo independiente para finiquitos laborales
 * conforme a la legislación mexicana 2025
 */

// Motor principal
export { calculateFiniquito } from './calculate-finiquito';

// Calculadores específicos
export { calculatePerceptions } from './calculate-perceptions';
export { calculateDeductions, calculateISR } from './calculate-deductions';

// Utilidades
export {
  round,
  calculateDaysWorked,
  calculateYearsWorked,
  getMinimumSalary,
  calculateRealDailySalary,
  calculateIntegratedDailySalary,
  calculateAguinaldoFactor,
  calculateVacationFactor,
  calculateVacationPremiumFactor,
  gratificationDaysToPesos,
  gratificationPesosToDays,
  calculateSeverance,
  validateDates,
  validateSalary,
  validateVacationPremium
} from './utils';

// Constantes
export {
  MINIMUM_SALARIES,
  DEFAULT_DAYS_FACTOR,
  DAYS_IN_YEAR,
  DAYS_IN_YEAR_WITH_LEAP,
  DEFAULT_PRESTACIONES,
  DECIMAL_PRECISION
} from './constants';

// Tipos
export type {
  FiniquitoInput,
  FiniquitoCalculationResult,
  PerceptionsCalculation,
  DeductionsCalculation,
  SalaryCalculation,
  CalculationMetadata
} from './types';

export type { PerceptionsInput } from './calculate-perceptions';
export type { DeductionsInput } from './calculate-deductions';

/**
 * Utilidades para cálculos de finiquitos
 */

import { SalaryFrequency, BorderZone } from '@workspace/database';
import {
  MINIMUM_SALARIES,
  DEFAULT_DAYS_FACTOR,
  DAYS_IN_YEAR,
  DAYS_IN_YEAR_WITH_LEAP,
  DEFAULT_PRESTACIONES,
  DECIMAL_PRECISION
} from './constants';

/**
 * Redondea un número a los decimales especificados
 */
export function round(value: number, decimals: number = DECIMAL_PRECISION.MONEY): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formatea un número como moneda con comas
 * @example formatMoney(1234567.89) => "1,234,567.89"
 * @example formatMoney(0) => "0.00"
 */
export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Calcula los días laborados entre dos fechas (inclusivo)
 */
export function calculateDaysWorked(hireDate: Date, terminationDate: Date): number {
  const diffTime = terminationDate.getTime() - hireDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 para hacer inclusivo ambos días
}

/**
 * Calcula los años trabajados con precisión decimal
 */
export function calculateYearsWorked(daysWorked: number): number {
  return round(daysWorked / DAYS_IN_YEAR_WITH_LEAP, DECIMAL_PRECISION.YEARS);
}

/**
 * Obtiene el salario mínimo según la zona
 */
export function getMinimumSalary(zone: BorderZone): number {
  return MINIMUM_SALARIES[zone];
}

/**
 * Calcula el salario diario real según la frecuencia de pago
 */
export function calculateRealDailySalary(
  salary: number,
  frequency: SalaryFrequency,
  daysFactor: number = DEFAULT_DAYS_FACTOR
): number {
  switch (frequency) {
    case SalaryFrequency.DAILY:
      return salary;

    case SalaryFrequency.WEEKLY:
      return round(salary / 7, DECIMAL_PRECISION.MONEY);

    case SalaryFrequency.BIWEEKLY:
      return round(salary / 15, DECIMAL_PRECISION.MONEY);

    case SalaryFrequency.MONTHLY:
      return round(salary / daysFactor, DECIMAL_PRECISION.MONEY);

    default:
      throw new Error(`Invalid salary frequency: ${frequency}`);
  }
}

/**
 * Calcula el Salario Diario Integrado (SDI)
 *
 * Fórmula: SDI = SDF × (1 + (días_aguinaldo/365) + ((días_vacaciones × prima_vacacional)/365))
 */
export function calculateIntegratedDailySalary(
  fiscalDailySalary: number,
  aguinaldoDays: number = DEFAULT_PRESTACIONES.AGUINALDO_DAYS,
  vacationDays: number = DEFAULT_PRESTACIONES.VACATION_DAYS,
  vacationPremium: number = DEFAULT_PRESTACIONES.VACATION_PREMIUM
): number {
  const aguinaldoFactor = aguinaldoDays / DAYS_IN_YEAR;
  const vacationFactor = (vacationDays * (vacationPremium / 100)) / DAYS_IN_YEAR;
  const multiplier = 1 + aguinaldoFactor + vacationFactor;

  return round(fiscalDailySalary * multiplier, DECIMAL_PRECISION.MONEY);
}

/**
 * Calcula el factor de aguinaldo proporcional
 *
 * Factor = (días_laborados / 365) × días_aguinaldo
 */
export function calculateAguinaldoFactor(
  daysWorked: number,
  aguinaldoDays: number = DEFAULT_PRESTACIONES.AGUINALDO_DAYS
): number {
  return round((daysWorked / DAYS_IN_YEAR) * aguinaldoDays, DECIMAL_PRECISION.FACTOR);
}

/**
 * Calcula el factor de vacaciones proporcional
 *
 * Factor = (días_laborados / 365) × días_vacaciones
 */
export function calculateVacationFactor(
  daysWorked: number,
  vacationDays: number = DEFAULT_PRESTACIONES.VACATION_DAYS
): number {
  return round((daysWorked / DAYS_IN_YEAR) * vacationDays, DECIMAL_PRECISION.FACTOR);
}

/**
 * Calcula el factor de prima vacacional
 *
 * Factor = factor_vacaciones × prima_vacacional
 */
export function calculateVacationPremiumFactor(
  vacationFactor: number,
  vacationPremium: number = DEFAULT_PRESTACIONES.VACATION_PREMIUM
): number {
  return round(vacationFactor * (vacationPremium / 100), DECIMAL_PRECISION.FACTOR);
}

/**
 * Convierte días de gratificación a pesos
 */
export function gratificationDaysToPesos(days: number, realDailySalary: number): number {
  return round(days * realDailySalary, DECIMAL_PRECISION.MONEY);
}

/**
 * Convierte pesos de gratificación a días
 */
export function gratificationPesosToDays(pesos: number, realDailySalary: number): number {
  if (realDailySalary === 0) return 0;
  return round(pesos / realDailySalary, DECIMAL_PRECISION.DAYS);
}

/**
 * Calcula indemnización
 *
 * Total = (meses × salario_mensual) + (días_por_año × años × salario_diario)
 */
export function calculateSeverance(
  months: number,
  daysPerYear: number,
  yearsWorked: number,
  dailySalary: number,
  daysFactor: number = DEFAULT_DAYS_FACTOR
): number {
  const monthlySalary = dailySalary * daysFactor;
  const monthsAmount = months * monthlySalary;
  const daysAmount = daysPerYear * yearsWorked * dailySalary;

  return round(monthsAmount + daysAmount, DECIMAL_PRECISION.MONEY);
}

/**
 * Valida que las fechas sean coherentes
 */
export function validateDates(hireDate: Date, terminationDate: Date): void {
  if (terminationDate < hireDate) {
    throw new Error('La fecha de baja no puede ser anterior a la fecha de ingreso');
  }
}

/**
 * Valida que el salario sea positivo
 */
export function validateSalary(salary: number): void {
  if (salary <= 0) {
    throw new Error('El salario debe ser mayor a 0');
  }
}

/**
 * Valida que la prima vacacional esté en rango válido
 */
export function validateVacationPremium(premium: number): void {
  if (premium < 0 || premium > 100) {
    throw new Error('La prima vacacional debe estar entre 0% y 100%');
  }
}

/**
 * Formatea una fecha como string largo en español (para PDF)
 * Trata la fecha como UTC para evitar problemas de timezone
 *
 * @example formatDateLong(new Date('2025-10-15T06:00:00.000Z')) => '15 DE OCTUBRE DE 2025'
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Usar métodos UTC para evitar conversión de timezone
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();

  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  return `${day} DE ${months[month]} DE ${year}`;
}

/**
 * Convierte una fecha a formato local UTC (para usar con date-fns)
 * Esto evita problemas de timezone tratando la fecha como si fuera local
 *
 * @example
 * // Entrada: "2025-10-15T06:00:00.000Z"
 * // Salida: Date object para "2025-10-15" en timezone local
 */
export function toLocalDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Extraer componentes UTC y crear fecha local
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  );
}

/**
 * Calcula los días de vacaciones que le corresponden a un empleado según su antigüedad
 * Basado en prestaciones superiores de ley
 *
 * @param hireDate - Fecha de ingreso del empleado (fiscal)
 * @param terminationDate - Fecha de baja del empleado (opcional, por defecto hoy)
 * @returns Número de días de vacaciones que le corresponden
 *
 * @example
 * getEmployeeVacationDays(new Date('2020-01-01')) // 18 días (4 años)
 * getEmployeeVacationDays(new Date('2020-01-01'), new Date('2023-01-01')) // 16 días (3 años)
 */
export function getEmployeeVacationDays(
  hireDate: Date | string,
  terminationDate?: Date | string
): number {
  const ranges = [
    { days: 12.0, start_year: 0.0, end_year: 1.0 },
    { days: 14.0, start_year: 1.0, end_year: 2.0 },
    { days: 16.0, start_year: 2.0, end_year: 3.0 },
    { days: 18.0, start_year: 3.0, end_year: 4.0 },
    { days: 20.0, start_year: 4.0, end_year: 5.0 },
    { days: 22.0, start_year: 5.0, end_year: 10.0 },
    { days: 24.0, start_year: 10.0, end_year: 15.0 },
    { days: 26.0, start_year: 15.0, end_year: 20.0 },
    { days: 28.0, start_year: 20.0, end_year: 25.0 },
    { days: 30.0, start_year: 25.0, end_year: 30.0 },
    { days: 32.0, start_year: 30.0, end_year: 50.0 }
  ];

  const today = terminationDate ? new Date(terminationDate) : new Date();
  const hire = new Date(hireDate);

  // Calcular años trabajados con precisión decimal
  const diffTime = today.getTime() - hire.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const years = diffDays / 365.25; // Usar 365.25 para considerar años bisiestos

  let vacationDays = 12; // Por defecto
  for (const range of ranges) {
    if (years >= range.start_year && years < range.end_year) {
      vacationDays = range.days;
      break;
    }
  }

  return vacationDays;
}

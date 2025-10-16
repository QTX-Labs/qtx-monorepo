/**
 * Tipos para el sistema de cálculo de finiquitos
 */

import { SalaryFrequency, BorderZone } from '@workspace/database';

/**
 * Input para calcular un finiquito
 */
export interface FiniquitoInput {
  // Datos básicos
  hireDate: Date;
  terminationDate: Date;

  // Datos salariales
  salary: number;
  salaryFrequency: SalaryFrequency;
  borderZone: BorderZone;
  fiscalDailySalary?: number; // Si no se provee, usa salario mínimo según zona
  daysFactor?: number;

  // Prestaciones
  aguinaldoDays?: number;
  vacationDays?: number;
  vacationPremium?: number; // Porcentaje entero (25 = 25%)
  pendingVacationDays?: number; // Beneficios Fiscales
  pendingVacationPremium?: number; // Beneficios Fiscales
  complementPendingVacationDays?: number; // Beneficios de Complemento
  complementPendingVacationPremium?: number; // Beneficios de Complemento
  workedDays?: number;
  realHireDate?: Date;

  // Gratificación (bidireccional - solo uno debe tener valor)
  gratificationType?: any; // GratificationType from database
  gratificationDays?: number;
  gratificationPesos?: number;

  // Indemnización (días)
  severanceDays?: number;

  // Prima de antigüedad (días)
  seniorityPremiumDays?: number;

  // Deducciones
  isrAmount?: number;
  subsidyAmount?: number;
  infonavitAmount?: number;
  fonacotAmount?: number;
  otherDeductions?: number;
}

/**
 * Resultado del cálculo de percepciones
 */
export interface PerceptionsCalculation {
  // Factores
  aguinaldoFactor: number;
  vacationFactor: number;
  vacationPremiumFactor: number;

  // Montos
  aguinaldoAmount: number;
  vacationAmount: number;
  vacationPremiumAmount: number;
  pendingVacationAmount: number;
  pendingPremiumAmount: number;
  workedDaysAmount: number;
  gratificationAmount: number;
  severanceAmount: number;
  seniorityPremiumAmount: number;

  // Total
  totalPerceptions: number;
}

/**
 * Resultado del cálculo de deducciones
 */
export interface DeductionsCalculation {
  isr: number;
  subsidy: number;
  infonavit: number;
  fonacot: number;
  otherDeductions: number;
  totalDeductions: number;
}

/**
 * Salarios calculados
 */
export interface SalaryCalculation {
  fiscalDailySalary: number;
  realDailySalary: number;
  integratedDailySalary: number;
}

/**
 * Metadata del cálculo
 */
export interface CalculationMetadata {
  daysWorked: number;
  yearsWorked: number;
  daysFactor: number;
  gratificationDays?: number;
  gratificationPesos?: number;
}

/**
 * Resultado completo del cálculo de finiquito
 */
export interface FiniquitoCalculationResult {
  // Salarios
  salaries: SalaryCalculation;

  // Metadata
  metadata: CalculationMetadata;

  // Percepciones (dos columnas)
  fiscalPerceptions: PerceptionsCalculation;
  realPerceptions: PerceptionsCalculation;

  // Deducciones
  deductions: DeductionsCalculation;

  // Totales
  totals: {
    netPayFiscal: number;
    netPayReal: number;
    netPayTotal: number;
  };

  // Legacy compatibility
  fiscalNetAmount: number;
  realNetAmount: number;
  totalToPay: number;
  gratificationDays?: number;
  gratificationPesos?: number;
}

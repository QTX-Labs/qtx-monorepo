import { BorderZone, SalaryFrequency } from '@workspace/database';

/**
 * Input para calculateFiniquitoComplete
 *
 * Datos necesarios para calcular un finiquito completo incluyendo factores, montos, ISR y totales
 */
export type CalculateFiniquitoInput = {
  // ===== DATOS BASE =====
  employeeId?: string;
  hireDate: Date;
  terminationDate: Date;

  // ===== FACTORES FISCALES =====
  fiscalDailySalary: number;
  integratedDailySalary: number;
  borderZone: BorderZone;
  salaryFrequency: SalaryFrequency;

  // ===== PRESTACIONES =====
  aguinaldoDays: number;
  vacationDays: number;
  vacationPremiumPercentage: number; // Porcentaje entero (25 = 25%)

  // ===== BENEFICIOS FISCALES =====
  pendingVacationDays?: number;
  pendingVacationPremium?: number;

  // ===== COMPLEMENTO (OPCIONAL) =====
  complemento?: {
    enabled: boolean;
    realHireDate: Date;
    realDailySalary: number;
    pendingVacationDays?: number;
    pendingVacationPremium?: number;
  };

  // ===== LIQUIDACIÓN (OPCIONAL) =====
  liquidacion?: {
    enabled: boolean;
  };

  // ===== DEDUCCIONES MANUALES (para cálculo en vivo) =====
  deduccionesManuales?: {
    infonavit?: number;
    fonacot?: number;
    otras?: number;
    subsidio?: number;
  };

  // ===== FACTORES MANUALES (OPCIONALES) =====
  // Permite sobrescribir factores calculados con valores editados por el usuario
  manualFactors?: {
    finiquito?: Partial<FactoresFiniquito>;
    liquidacion?: Partial<FactoresLiquidacion>;
    complemento?: Partial<FactoresFiniquito>;
  };
};

/**
 * Detalle de una percepción con bases gravables y exentas
 */
export type PerceptionDetail = {
  totalAmount: number;      // Monto total
  totalTaxBase: number;     // Base gravable
  totalExemptBase: number;  // Base exenta
  totalQuantity: number;    // Cantidad/días
};

/**
 * Factores calculados para finiquito o complemento
 */
export type FactoresFiniquito = {
  diasTrabajados: number;
  septimoDia: number;
  vacaciones: number;
  primaVacacional: number;
  aguinaldo: number;
};

/**
 * Factores calculados para liquidación
 */
export type FactoresLiquidacion = {
  indemnizacion90Dias: number;
  indemnizacion20Dias: number;
  primaAntiguedad: number;
};

/**
 * Montos calculados para finiquito o complemento
 */
export type MontosFiniquito = {
  diasTrabajados: PerceptionDetail;
  septimoDia: PerceptionDetail;
  vacaciones: PerceptionDetail;
  primaVacacional: PerceptionDetail;
  aguinaldo: PerceptionDetail;
};

/**
 * Montos calculados para liquidación
 */
export type MontosLiquidacion = {
  indemnizacion90Dias: PerceptionDetail;
  indemnizacion20Dias: PerceptionDetail;
  primaAntiguedad: PerceptionDetail;
};

/**
 * Totales de una sección (percepciones, deducciones, neto)
 */
export type TotalesSeccion = {
  percepciones: number;
  deducciones: number;
  neto: number;
};

/**
 * Output de calculateFiniquitoComplete
 *
 * Resultado completo del cálculo de finiquito con factores, montos, ISR, deducciones y totales
 */
export type CalculateFiniquitoOutput = {
  // ===== FACTORES (en días) =====
  factores: {
    finiquito: FactoresFiniquito;
    liquidacion?: FactoresLiquidacion;
    complemento?: FactoresFiniquito;
  };

  // ===== MONTOS (con bases gravables/exentas) =====
  montos: {
    finiquito: MontosFiniquito;
    liquidacion?: MontosLiquidacion;
    complemento?: MontosFiniquito;
  };

  // ===== ISR =====
  isr: {
    isrFiniquito: number;     // ISR sobre días trabajados, vacaciones, séptimo día
    isrArt174: number;        // ISR sobre aguinaldo y prima vacacional
    isrIndemnizacion: number; // ISR sobre indemnizaciones (si aplica)
  };

  // ===== DEDUCCIONES =====
  deducciones: {
    isrTotal: number;   // Suma de los 3 ISR
    infonavit: number;  // Deducción manual
    fonacot: number;    // Deducción manual
    otras: number;      // Deducción manual
    subsidio: number;   // Deducción manual
    total: number;      // Suma de todas las deducciones
  };

  // ===== TOTALES POR SECCIÓN =====
  totales: {
    finiquito: TotalesSeccion;
    liquidacion?: TotalesSeccion;
    complemento?: TotalesSeccion;
    totalAPagar: number; // Suma de todos los netos
  };

  // ===== METADATA =====
  metadata: {
    daysWorked: number;
    yearsWorked: number;
    daysFactor: number;
  };
};

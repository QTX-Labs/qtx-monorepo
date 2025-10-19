import { z } from "zod";

export type PayrollCalculationSettings = {
  calculationUsingCalendarDays: boolean;
  isInfonavitLimitDisabled: boolean;
  calculateISROnMinWage?: boolean;
  pendingBalance: {
    enableInfonavit: boolean;
    enableFonacot: boolean;
  };
  infonavit: {
    enableSeguroVivienda: boolean;
    cuotaFijaCalculationMethod: 'default' | 'simplificado';
  };
};


export type PayrollSettings = {
  calculationSettings: PayrollCalculationSettings;
  weeklyRestDay: number;
};

export type ISRRates = {
  effectiveDate: Date;
  rangeValues: ISRRangeValues[];
};

export type ISRRangeValues = {
  lowerLimit: number;
  upperLimit: number;
  fixedFee: number;
  percentageOverSurplus: number;
};

export type PerceptionsResult = {
  diasLaborados?: Perception;
  septimoDia?: Perception;
  vacaciones?: Perception;
  primaVacacional?: Perception;
  domingosLaborados?: Perception;
  primaDominical?: Perception;
  descansosLaborados?: Perception;
  festivosLaborados?: Perception;
  horasExtrasDobles?: Perception;
  horasExtrasTriples?: Perception;
  valesDespensa?: Perception;
  fondoAhorro?: Perception;
  incapacidadPagada?: Perception;
  retroactivoSueldo?: Perception;
  permisoSinGoce?: Perception;
  permisoConGoce?: Perception;
};

export type PayrollIncidences = {
  faltas?: Date[];
  incapacidades?: Date[];
  permisoSinGoce?: Date[];
  permisoConGoce?: Date[];
  vacations?: Date[];
  domingosLaborados?: Date[];
  descansosLaborados?: Date[];
  primaVacacional?: Date[];
  festivosLaborados?: Date[];
  retardos?: Date[];
  horasExtras: HorasExtras[];
  retroactivoSueldo?: Date[];
  percepciones: Concepto[];
  deducciones: Concepto[];
  valesDespensa?: BenefitSetting;
  fondoAhorro?: BenefitSetting;
  pendingBalances?: PendingBalance[];
  ajusteInfonavit?: DeduccionAjuste[];
  ajusteFoncacot?: DeduccionAjuste[];
};

export type FonacotActionType = 'activo' | 'inactivo';

export type FonacotCredit = {
  effectiveDate: Date;
  monthlyDiscountAmount?: number;
  actionType: FonacotActionType;
};


export enum PendingBalanceConcept {
  INFONAVIT = "INFONAVIT",
  FONACOT = "FONACOT",
}

export const PendingBalance = z.object({
  periodId: z.string(),
  conceptType: z.nativeEnum(PendingBalanceConcept),
  totalDiscount: z.number(),
  paidAmount: z.number(),
  pendingAmount: z.number(),
})

export type PendingBalance = z.infer<typeof PendingBalance>

export enum BenefitType {
  Percentage = "porcentaje",
  Amount = "monto",
  IncidenceBased = "basadoEnIncidencias",
}


export type BenefitSetting = {
  tipo: BenefitType;
  valor: number;
};


export type DeduccionAjuste = {
  id: string;
  monto: number;
};


export type HorasExtras = {
  effectiveDate: Date;
  quantity: number;
};

export type EffectiveValue = {
  effectiveDate: Date;
  value: number;
};

export enum AffiliateMovementAction {
  Alta = "alta",
  Baja = "baja",
  ModificacionSalario = "modificacion salario",
  Reingreso = "reingreso"
}

export interface AffiliateMovement {
  effectiveDate: Date,
  action: AffiliateMovementAction,
  dailySalary?: number,
  hourlySalary?: number,
  integratedDailySalary?: number,
  variableSalary?: number,
};

export type InputISRDailyCalculationValues = {
  isrRates: ISRRates[];
  perceptions: PerceptionsResult[];
  minimumSalary: EffectiveValue[];
  affiliateMovements: AffiliateMovement[];
};

export type ISRDailyCalculationValues = {
  date?: Date;
  isrRates: ISRRates;
  subsidyRates: SubsidyRates;
  perceptions: PerceptionsResult;
  minimumSalary?: number;
  dailySalary?: number;
  otrasPercepciones: Concepto[];
};

export type Concepto = {
  id?: string;
  conceptoVisual: string;
  conceptoFacturacion: string;
  calculoISR?: CalculoISR;
  calculoISN?: CalculoISN;
  calculoIMSS?: CalculoIMSS;
  excluirDelComplemento?: boolean;
  pagoEnEfectivo?: boolean;
  monto: number;
};

export enum CalculoISR {
  Gravado = "gravado",
  Exento = "exento",
}

export enum CalculoIMSS {
  Gravado = "gravado",
  Exento = "exento",
}

export enum CalculoISN {
  Gravado = "gravado",
  Exento = "exento",
}

export type SubsidyRates = {
  effectiveDate: Date;
  rangeValues: SubsidyRangeValues[];
};

export type SubsidyRangeValues = {
  lowerLimit: number;
  upperLimit: number;
  subsidyAmount: number;
};


export type ISRResult = {
  detail: ISRDetail[];
  isrRetenidoDeMenos?: number;
  reintegroISRRetenidoDeMas?: number;
  reintegroISRRetenidoDeMasEfectivo?: number;
  ajusteSubsidioCausado?: number;
  isrPeriodo: number;
  totalImpuesto: number;
  isrCargo?: number;
  totalImpuestoAjusteMensual?: number;
  totalImpuestoSalarioMinimo?: number;
};

export type BaseGravableISRArt174 = {
  aguinaldo: number;
  primaVacacional: number;
  primaVacacionalPendiente: number;
  total: number;
};

export type ISRArt174Result = {
  salarioDiario: number;
  sueldoMesualOrinario: number;
  baseGravable: BaseGravableISRArt174;
  fraccionUno: number;
  fraccionDos: number;
  fraccionTres: number;
  factor: number;
  calculoISRBaseGravableSueldoMesual: ISRDetail;
  calculoISRSueldoMensual: ISRDetail;
  totalImpuesto: number;
};

export type ISRDetail = {
  isrRangeValue?: ISRRangeValues;
  subsidyRangeValue?: SubsidyRangeValues;
  totalPercepciones: number;
  baseGravable: number;
  baseImponible: number;
  impuestoPrevio: number;
  subsidio: number;
  isrAntesSubsidio: number;
  impuesto: number;
};

export type InputISRArt174 = {
  aguinaldo: Perception;
  primaVacacional: Perception;
  primaVacacionalPendiente: Perception;
  sueldoDiario: number;
  tablaISR: ISRRates;
  frecuencia?: Frequency;
  calculationType?: CalculationType;
};

export enum CalculationType {
  FINQUITO = "FINQUITO",
  AGUINALDO = "AGUINALDO",
}

export enum Frequency {
  Semanal = 'Semanal',
  Quincenal = 'Quincenal',
  Mensual = 'Mensual',
  Catorcenal = 'Catorcenal',
  Decenal = 'Decenal',
}


export type InputISRArt154 = {
  indemnizacionVeinteDias: Perception;
  indemnizacionNoventaDias: Perception;
  primaAntiguedad: Perception;
  sueldoDiario: number;
  tablaISR: ISRRates;
};

export type InputISRFiniquito = {
  diasTrabajados: Perception;
  septimoDia: Perception;
  vacaciones: Perception;
  vacacionesPendientes: Perception;
  sueldoDiario: number;
  otrasPercepciones: Array<Concepto>;
  tablaISR: ISRRates;
};

export type ISRReversaResult = {
  isrResult: ISRResult;
  conceptoCalculoInvertido: Concepto;
};

export type ConceptosFiniquito = {
  diasTrabajados: number;
  septimoDia: number;
  vacaciones: number;
  vacacionesPendientes: number;
  primaVacacional: number;
  primaVacacionalPendiente: number;
  aguinaldo: number;
  diasRetroactivosSueldo: number;
};

export type ConceptosLiquidacion = {
  indemnizacionVeinteDias: number;
  indemnizacionNoventaDias: number;
  primaAntiguedad: number;
};

export type Antiguedad = {
  anios: number;
  dias: number;
  factor: number;
};

export type Perception = {
  totalQuantity: number;
  totalTaxBase: number;
  totalExemptBase: number;
  totalAmount: number;
  detail: PerceptionDetail[];
};

export type PerceptionDetail = {
  date: Date;
  umaValue: number;
  quantity: number;
  taxBase: number;
  exemptBase: number;
  amount: number;
};


export type PercepcionesFiniquito = {
  diasTrabajados: Perception;
  septimoDia: Perception;
  vacaciones: Perception;
  vacacionesPendientes: Perception;
  primaVacacional: Perception;
  primaVacacionalPendiente: Perception;
  aguinaldo: Perception;
  diasRetroactivosSueldo: Perception;
};

export type PercepcionesLiquidacion = {
  indemnizacionVeinteDias: Perception;
  indemnizacionNoventaDias: Perception;
  primaAntiguedad: Perception;
};

export type FactoresCalculoFiniquitoLiquidacion = {
  salarioDiario: number;
  salarioDiarioIntegrado: number;
  antiguedad: Antiguedad;
  conceptosFiniquito: ConceptosFiniquito;
  conceptosLiquidacion: ConceptosLiquidacion;
  otrasPercepciones: Array<Concepto>;
  otrasDeducciones: Array<Concepto>;
};

export type BenefitByLawConfiguration = {
  primaVacacional?: number; // Porcentaje de prima vacacional (default: 25)
  aguinaldo?: number;        // Días de aguinaldo (default: 15)
};

export type InfonavitActionType = '15' | '16' | '17' | '18' | '19' | '20';
export type InfonavitDiscountType = '1' | '2' | '3';

const InfonavitInicioCreditoVivienda: InfonavitActionType = '15';
const InfonavitSuspensionDescuento: InfonavitActionType = '16';
const InfonavitReinicioDescuento: InfonavitActionType = '17';
const InfonavitModificacionTipoDescuento: InfonavitActionType = '18';
const InfonavitModificacionValorDescuento: InfonavitActionType = '19';
const InfonavitModificacionNumeroCredito: InfonavitActionType = '20';

const InfonavitDescuentoPorcentaje: InfonavitDiscountType = '1';
const InfonavitDescuentoCuotaFija: InfonavitDiscountType = '2';
const InfonavitDescuentoFactorUMI: InfonavitDiscountType = '3';

export type InfonavitCredit = {
  effectiveDate: Date;
  value?: number;
  discountType: InfonavitDiscountType;
  actionType: InfonavitActionType;
};

export type MinimumSalary = {
  effectiveDate: string;
  generalSalary: number;
  borderZoneSalary: number;
};


export type PayrollConstants = {
  minimumSalaryValues?: MinimumSalary[];
  umaValues?: EffectiveValue[];
  umiValues?: EffectiveValue[];
  isnValues?: EffectiveValue[];
  socialCostFees: SocialCostFees[];
  cesantiaVejezFees: FeeCesantiaVejez[];
  laborRiskPremiums: LaborRiskPremium[];
  isrRates: ISRRates[];
};

export type SocialCostFees = {
  effectiveDate: Date;
  invalidezYVida: FeeDetail;
  retiro: FeeDetail; // Con incapacidades / con faltas
  cesantiaYVejez: FeeDetail;
  guarderiasYPrestacionesSociales: FeeDetail;
  infonavit: FeeDetail; // Con incapacidades / con faltas
  enfermedadesYMaternidad: FeeEnfermedadesYMaterndiad;
};

export type FeeCesantiaVejez = {
  effectiveDate: Date;
  rangeValues: RangeValuesCesantiaVejez[];
};

export type LaborRiskPremium = {
  percentage: number;
  effectiveDate: Date;
};


export type FeeEnfermedadesYMaterndiad = {
  cuotaFija: FeeDetail;
  cuotaAdicional: FeeDetail;
  gastosMedicos: FeeDetail;
  dinero: FeeDetail;
};

export type FeeDetail = {
  employersPercentage: number;
  workersPercentage: number;
  umasLimit?: number;
};

export type RangeValuesCesantiaVejez = {
  lowerLimit: number;
  upperLimit: number;
  percentage: number;
};


export type ConfiguracionCalculoFiniquitoLiquidacion = {
  payrollSettings: PayrollSettings;
  infonavit?: Array<{
    credit: InfonavitCredit;
    diasPendientes: number;
    montoAjuste: number;
    seguroVivienda: number;
  }>;
  factoresCalculo: FactoresCalculoFiniquitoLiquidacion;
  factoresComplemento?: FactoresCalculoFiniquitoLiquidacion;
  payrollConstants: PayrollConstants;
  acumuladoPercepciones: Array<PerceptionsResult>;
  benefitByLawConfiguration?: BenefitByLawConfiguration;
};

export type ResultadoISRFiniquitoLiquidacion = {
  isrFiniquito: ISRResult;
  isrArt174: ISRArt174Result | void;
  isrIndemnizacion: ISRResult;
};

export type ResultadoCalculoFiniquitoLiquidacion = {
  percepcionesFiniquito: PercepcionesFiniquito;
  percepcionesFiniquitoComplemento?: PercepcionesFiniquito;
  percepcionesLiquidacion: PercepcionesLiquidacion;
  percepcionesLiquidacionComplemento?: PercepcionesLiquidacion;
  calculoISR: ResultadoISRFiniquitoLiquidacion;
  otrasDeducciones: Array<Concepto>;
  otrasDeduccionesComplemento?: Array<Concepto>;
  otrasPercepciones: Array<Concepto>;
  otrasPercepcionesComplemento?: Array<Concepto>;
  totalPercepcionesComplemento?: number;
  totalDeduccionesComplemento?: number;
  complementoNeto?: number;
  infonavit?: Array<{
    credit: InfonavitCredit;
    diasPendientes: number;
    montoCalculadoDiasPendientes: number;
    montoAjuste: number;
    seguroVivienda: number;
  }>;
  totalInfonavit?: number;
  finiquito: {
    neto: number;
    totalPercepciones: number;
    totalDeducciones: number;
    totalPercepcionesFiscal: number;
    totalDeduccionesFiscal: number;
    netoComplemento: number;
    netoFiscal: number;
  };
  liquidacion: {
    neto: number;
    totalPercepciones: number;
    totalDeducciones: number;
    totalPercepcionesFiscal: number;
    totalDeduccionesFiscal: number;
    netoComplemento: number;
    netoFiscal: number;
  };
};

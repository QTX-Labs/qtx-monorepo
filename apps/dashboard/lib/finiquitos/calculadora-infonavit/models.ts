import { AffiliateMovement, AffiliateMovementAction, EffectiveValue, FonacotActionType, FonacotCredit, Frequency, InfonavitActionType, InfonavitCredit, InfonavitDiscountType, ISRRates, MinimumSalary, PayrollIncidences } from "../calculadora-finiquitos/models";

type EstadoDiaEmpleado =
  | "Incapacidad"
  | "Ausentismo"
  | "DiaLaborado"
  | "Vacacion"
  | "DescansoLaborado"
  | "FestivoLaborado"
  | "SeptimoDia"
  | "Baja"
  | "RetroactivoSueldo"
  | "PermisoSinGoce"
  | "PermisoConGoce";

export enum TipoDescuentoFondoAhorro {
  Porcentaje = "porcentaje",
  Monto = "monto",
}

type InputPerceptionsDailyCalculationValues = {
  payrollIncidences: PayrollIncidences;
  affiliateMovements: AffiliateMovement[];
  isrRates: ISRRates[];
  umas: EffectiveValue[];
  minimumSalary: MinimumSalary[];
  isBorderZone: boolean;
  payrollFrequency: Frequency;
};

type InputInfonavitDailyCalculationValues = {
  payrollIncidences: PayrollIncidences;
  affiliateMovements: AffiliateMovement[];
  umiValues: EffectiveValue[];
  infonavitCredit: InfonavitCredit[];
  minimumSalary: MinimumSalary[];
  isBorderZone: boolean;
  payrollFrequency: Frequency;
};

type InputFonacotDailyCalculationValues = {
  payrollIncidences: PayrollIncidences;
  affiliateMovements: AffiliateMovement[];
  fonacotCredit: FonacotCredit[];
  payrollFrequency: Frequency;
};

type PerceptionsDailyCalculationValues = {
  date: Date;
  affiliateMovementAction: AffiliateMovementAction;
  ISRRates: ISRRates;
  umaValue: number;
  dailySalary: number;
  hourlySalary: number;
  minimumSalary: number;
  type?: EstadoDiaEmpleado;
  primaVacacional: number;
  primaDominical: boolean;
  horasExtrasDobles: number;
  horasExtrasTriples: number;
  horasExtrasAcumuladas: number;
  retardo: number;
};

type InfonavitDailyCalculationValues = {
  date: Date;
  affiliateMovementAction: AffiliateMovementAction;
  umiValue: number;
  minimumSalary: number;
  variableSalary: number;
  dailySalary: number;
  integratedDailySalary: number;
  type?: EstadoDiaEmpleado;
  discountType: InfonavitDiscountType;
  actionType: InfonavitActionType;
  discountValue: number;
};

type FonacotDailyCalculationValues = {
  date: Date;
  affiliateMovementAction: AffiliateMovementAction;
  actionType: FonacotActionType;
  type?: EstadoDiaEmpleado;
  discountValue: number;
};

type GenericConcept = {
  concept: string;
  invoiceConcept: string;
  amount: number;
};

export type ConfiguracionFondoAhorro = {
  tipoDescuento: TipoDescuentoFondoAhorro;
  valor: number;
};

export type {
  InputPerceptionsDailyCalculationValues,
  PerceptionsDailyCalculationValues,
  EstadoDiaEmpleado,
  InputInfonavitDailyCalculationValues,
  InfonavitDailyCalculationValues,
  InputFonacotDailyCalculationValues,
  FonacotDailyCalculationValues,
  GenericConcept,
};

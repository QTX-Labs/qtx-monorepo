
export type TerminationProportionalResponse = {
  results: Array<TerminationProportionalResult>;
  metadatos: {
    calculationDate: Date;
    totalCalculations: number;
    successfulCalculations: number;
    failedCalculations: number;
  };
};


export type TerminationProportionalRequest = {
  calculations: Array<InputProportionalCalculation>;
};

export type InputProportionalCalculation = {
  employeeId: string;
  isSeveranceCalculationEnabled: boolean;
  fiscal: InputProportionalCalculationFiscal;
  complement?: InputProportionalCalculationComplement;
  benefitByLawConfiguration?: BenefitByLawConfiguration;
};

export type BenefitByLawConfiguration = {
  primaVacacional?: number; // Porcentaje de prima vacacional (default: 25)
  aguinaldo?: number;        // Días de aguinaldo (default: 15)
};

export type InputProportionalCalculationFiscal = {
  entryDate: string;
  calculationDate: string;
  dailySalary: number;
  integratedDailySalary: number;
  pendingVacations?: number;
  pendingVacationBonus?: number;
};

export type InputProportionalCalculationComplement = {
  entryDate: string;
  calculationDate: string;
  dailySalary: number;
  pendingVacations?: number;
  pendingVacationBonus?: number;
};

export type TerminationProportionalResult = {
  employeeId: string;
  status: string;
  message: string;
  fiscal: FiscalSettlementCalculation;
  complement?: ComplementarySettlementCalculation;
};

export type Seniority = {
  years: number;
  days: number;
  factor: number;
};

export type ProportionalSettlementConcepts = {
  vacations: number;
  vacationBonus: number;
  christmasBonus: number;
  pendingVacations?: number;
  pendingVacationBonus?: number;
};

export type ProportionalSeveranceConcepts = {
  twentyDaysSeverance: number;
  ninetyDaysSeverance: number;
  seniorityBonus: number;
};

export type FiscalSettlementCalculation = {
  dailySalary: number;
  integratedDailySalary: number;
  seniority: Seniority;
  proportionalSettlementConcepts: ProportionalSettlementConcepts;
  proportionalSeveranceConcepts?: ProportionalSeveranceConcepts;
};

export type ComplementarySettlementCalculation = {
  dailySalary: number;
  seniority: Seniority;
  proportionalSettlementConcepts: ProportionalSettlementConcepts;
  proportionalSeveranceConcepts?: ProportionalSeveranceConcepts;
};

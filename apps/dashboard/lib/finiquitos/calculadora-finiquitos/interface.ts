import { Concepto, ConfiguracionCalculoFiniquitoLiquidacion, Frequency, InputISRArt154, InputISRArt174, InputISRFiniquito, ISRArt174Result, ISRDailyCalculationValues, ISRResult, ISRReversaResult, PerceptionsResult, ResultadoCalculoFiniquitoLiquidacion } from "./models";


export type InputCalculoFactores = {
  fechaBaja: Date;
  fechaIngreso: Date;
  salarioDiario: number;
  salarioDiarioIntegrado: number;
  calcularLiquidacion: boolean;
};

export interface CalculadoraFiniquitoLiquidacion {
  calcular(
    input: ConfiguracionCalculoFiniquitoLiquidacion
  ): ResultadoCalculoFiniquitoLiquidacion | void;
}



export interface ISRCalculator {
  calculateISR(
    values: ISRDailyCalculationValues[],
    otraPercepcion: Concepto[],
    frequency: Frequency,
    accumulatedMonthlyISR: ISRResult[],
    isLastPeriod: boolean
  ): ISRResult;
  calculoISRReversa(
    montoCalculoInvertido: number,
    imssEmpleado: number,
    values: ISRDailyCalculationValues[],
    frequency: Frequency,
    accumulatedMonthlyISR: ISRResult[],
    isLastPeriod: boolean,
  ): ISRReversaResult;
  calculateMonthlyAdjustment(
    values: ISRDailyCalculationValues[],
    isr: ISRResult,
    accumulatedMonthlyISR: ISRResult[],
    perceptions: PerceptionsResult,
    accumulatedPerceptions: PerceptionsResult[]
  ): ISRResult;
  calcularISRFiniquito(input: InputISRFiniquito): ISRResult;
  calcularISRArt174(input: InputISRArt174): ISRArt174Result | void;
  calcularISRArt93(input: InputISRArt154): ISRResult;
}

export interface ICalculator {
  add: (n: number) => ICalculator;
  subtract: (a: number) => ICalculator;
  multiply: (a: number) => ICalculator;
  divide: (a: number) => ICalculator;
  percentage: (a: number) => ICalculator;
  get value(): number;
  get result(): number;
}

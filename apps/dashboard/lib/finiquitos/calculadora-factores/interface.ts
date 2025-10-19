import { BenefitByLawConfiguration, ProportionalSeveranceConcepts, TerminationProportionalRequest, TerminationProportionalResponse } from "./models";

export interface TerminationProportionalService {
  calculateProportionals(
    input: TerminationProportionalRequest
  ): TerminationProportionalResponse;
}
export interface IDateOperations {
  fullYearsDifference(start: Date | string, end: Date | string): number;
  getDaysExcludingFullYears(start: Date | string, end: Date | string): number;
  getTotalDaysOfYear(date: string | Date): number;
  getFirstDayOfYear(date: string | Date): Date;
}

export interface DateComparer {
  isSameYearDay(date1: Date, date2: Date): boolean;
  isSameYearMonth(date1: Date, date2: Date): boolean;
  isSameOrAfterYearDay(date1: Date, date2: Date): boolean;
  isSameOrAfterDate(date1: Date | string, date2: Date | string): boolean;
}


export interface ProportionalCalculator {
  getProportionalVacationDays(
    fechaIngreso: string | Date,
    fechaCalculo: string | Date
  ): number;
  getProportionalVacationBonus(
    fechaIngreso: string | Date,
    fechaCalculo: string | Date,
    benefitConfig?: BenefitByLawConfiguration
  ): number;
  getProportionalChristmasBonus(
    entryDate: string | Date,
    calculationDate: string | Date,
    benefitConfig?: { primaVacacional?: number; aguinaldo?: number }
  ): number;
  getProportionalSeverance(
    fechaIngreso: string | Date,
    fechaCalculo: string | Date
  ): ProportionalSeveranceConcepts;
}

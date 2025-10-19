import { BigCalculatorImpl } from "../calculadora-finiquitos/calculadora";
import { ICalculator } from "../calculadora-finiquitos/interface";
import { MomentDateComparer } from "./calculadora-moment";
import { DateComparer, IDateOperations, ProportionalCalculator } from "./interface";
import { ProportionalSeveranceConcepts } from "./models";
import { calculateSeniority } from "./utils";
import { VACATION_DAYS_AFTER_2023, VACATION_DAYS_BEFORE_2023 } from "./vacation";
import { MomentImplementation as ImplDateOperations } from "./calculadora-moment";

export class ProportionalCalculatorImplV1 implements ProportionalCalculator {
  private _dateComparison: DateComparer;
  private _dateOperations: IDateOperations;

  constructor() {
    this._dateComparison = new MomentDateComparer();
    this._dateOperations = new ImplDateOperations("UTC");
  }

  getProportionalVacationDays(
    entryDate: string | Date,
    calculationDate: string | Date
  ): number {
    const lastDayCalculationDate =
      this._dateOperations.getTotalDaysOfYear(calculationDate);
    const workedDaysLastYear = this._dateOperations.getDaysExcludingFullYears(
      entryDate,
      calculationDate
    );
    const senority = calculateSeniority(entryDate, calculationDate);
    const vacationDays = this.getVacationDays(calculationDate, senority.factor);
    const resultVacationDays: ICalculator = new BigCalculatorImpl(
      workedDaysLastYear
    )
      .multiply(vacationDays)
      .divide(lastDayCalculationDate);

    return resultVacationDays.result;
  }

  getProportionalVacationBonus(
    entryDate: string | Date,
    calculationDate: string | Date,
    benefitConfig?: { primaVacacional?: number; aguinaldo?: number }
  ): number {
    const vacationBonus = benefitConfig?.primaVacacional ?? 25;
    const vacationDays = this.getProportionalVacationDays(
      entryDate,
      calculationDate
    );
    const resultVacationBonus: ICalculator = new BigCalculatorImpl(
      vacationDays
    ).percentage(vacationBonus);

    return resultVacationBonus.result;
  }

  getProportionalChristmasBonus(
    entryDate: string | Date,
    calculationDate: string | Date,
    benefitConfig?: { primaVacacional?: number; aguinaldo?: number }
  ): number {
    const bonusDays = benefitConfig?.aguinaldo ?? 15;
    const firstDayOfYear =
      this._dateOperations.getFirstDayOfYear(calculationDate);
    const lastDayCalculationDate =
      this._dateOperations.getTotalDaysOfYear(calculationDate);

    // Compara la fecha de ingreso con el primer día del año y toma la más reciente
    const startDate = this._dateComparison.isSameOrAfterDate(entryDate, firstDayOfYear)
      ? entryDate
      : firstDayOfYear;

    // Validación: la fecha de inicio debe ser menor o igual a la fecha de cálculo
    if (!this._dateComparison.isSameOrAfterDate(calculationDate, startDate)) {
      throw new Error('La fecha de cálculo debe ser mayor o igual a la fecha de inicio');
    }

    const workedDaysLastYear = this._dateOperations.getDaysExcludingFullYears(
      startDate,
      calculationDate
    );
    const resultBonusDays: ICalculator = new BigCalculatorImpl(
      workedDaysLastYear
    )
      .multiply(bonusDays)
      .divide(lastDayCalculationDate);

    return resultBonusDays.result;
  }

  getProportionalSeverance(
    entryDate: string | Date,
    calculationDate: string | Date
  ): ProportionalSeveranceConcepts {
    const senority = calculateSeniority(entryDate, calculationDate);
    const twentyDaysSeverance: ICalculator = new BigCalculatorImpl(20).multiply(
      senority.factor
    );
    const seniorityBonus: ICalculator = new BigCalculatorImpl(12).multiply(
      senority.factor
    );
    const result: ProportionalSeveranceConcepts = {
      ninetyDaysSeverance: 90,
      twentyDaysSeverance: twentyDaysSeverance.result,
      seniorityBonus: seniorityBonus.result,
    };

    return result;
  }

  private getVacationDays(
    calculationDate: string | Date,
    senorityFactor: number
  ): number {
    const roundedSenorityFactor = Math.ceil(senorityFactor);
    const vacationTable = this._dateComparison.isSameOrAfterDate(
      calculationDate,
      "2023-01-01"
    )
      ? VACATION_DAYS_AFTER_2023
      : VACATION_DAYS_BEFORE_2023;

    let vacationDays: number =
      vacationTable.find((v) => v.year === roundedSenorityFactor)?.days || 0;

    if (vacationDays == 0) {
      if (
        roundedSenorityFactor < vacationTable[0].year &&
        roundedSenorityFactor > 0
      ) {
        vacationDays = vacationTable[0].days;
      } else if (
        roundedSenorityFactor > vacationTable[vacationTable.length - 1].year
      ) {
        vacationDays = vacationTable[vacationTable.length - 1].days;
      }
    }

    return vacationDays;
  }
}

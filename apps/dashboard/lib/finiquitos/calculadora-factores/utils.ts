import { BigCalculatorImpl } from "../calculadora-finiquitos/calculadora";
import { ICalculator } from "../calculadora-finiquitos/interface";
import { IDateOperations } from "./interface";
import { Seniority } from "./models";
import { MomentImplementation as ImplDateOperations } from "./calculadora-moment";


export const calculateSeniority = (
  entryDate: string | Date,
  calculationDate: string | Date
): Seniority => {
  const dateOperations: IDateOperations = new ImplDateOperations();
  const yearsDifference = dateOperations.fullYearsDifference(
    entryDate,
    calculationDate
  );
  const daysDifference = dateOperations.getDaysExcludingFullYears(
    entryDate,
    calculationDate
  );
  const totalDaysLastYear = dateOperations.getTotalDaysOfYear(calculationDate);
  const factor: ICalculator = new BigCalculatorImpl(daysDifference)
    .divide(totalDaysLastYear)
    .add(yearsDifference);
  const result: Seniority = {
    years: yearsDifference,
    days: daysDifference,
    factor: factor.result,
  };

  return result;
};

import { BigCalculatorImpl } from "../calculadora-finiquitos/calculadora";
import { ICalculator } from "../calculadora-finiquitos/interface";
import { ProportionalCalculatorImplV1 } from "./calculadora-proporcionales";
import { ProportionalCalculator, TerminationProportionalService } from "./interface";
import { ProportionalSeveranceConcepts, TerminationProportionalRequest, TerminationProportionalResponse, TerminationProportionalResult } from "./models";
import { calculateSeniority } from "./utils";

export class DefaultTerminationProportionalImpl
  implements TerminationProportionalService {
  private proportionalCalculator: ProportionalCalculator;

  constructor() {
    this.proportionalCalculator = new ProportionalCalculatorImplV1();
  }

  calculateProportionals(
    input: TerminationProportionalRequest
  ): TerminationProportionalResponse {
    const defaultProportionalSeveranceConcepts: ProportionalSeveranceConcepts =
    {
      twentyDaysSeverance: 0,
      ninetyDaysSeverance: 0,
      seniorityBonus: 0,
    };

    const results: TerminationProportionalResult[] = Array(
      input.calculations.length
    );

    input.calculations.forEach((calculation, index) => {
      const integratedDailySalary: ICalculator = new BigCalculatorImpl(
        calculation.fiscal.integratedDailySalary,
        4
      );
      const vacations = this.proportionalCalculator.getProportionalVacationDays(
        calculation.fiscal.entryDate,
        calculation.fiscal.calculationDate
      );

      const vacationBonus = this.proportionalCalculator.getProportionalVacationBonus(
        calculation.fiscal.entryDate,
        calculation.fiscal.calculationDate,
        calculation.benefitByLawConfiguration
      )

      const christmasBonus = this.proportionalCalculator.getProportionalChristmasBonus(
        calculation.fiscal.entryDate,
        calculation.fiscal.calculationDate,
        calculation.benefitByLawConfiguration
      )

      results[index] = {
        employeeId: calculation.employeeId,
        status: "success",
        message: "Calculation successful",
        fiscal: {
          dailySalary: calculation.fiscal.dailySalary,
          integratedDailySalary: integratedDailySalary.result,
          seniority: calculateSeniority(
            calculation.fiscal.entryDate,
            calculation.fiscal.calculationDate
          ),
          proportionalSettlementConcepts: {
            vacations: vacations,
            vacationBonus: vacationBonus,
            christmasBonus: christmasBonus,
            pendingVacations: calculation.fiscal.pendingVacations,
            pendingVacationBonus: calculation.fiscal.pendingVacationBonus,
          },
          proportionalSeveranceConcepts:
            calculation.isSeveranceCalculationEnabled
              ? this.proportionalCalculator.getProportionalSeverance(
                calculation.fiscal.entryDate,
                calculation.fiscal.calculationDate
              )
              : defaultProportionalSeveranceConcepts,
        },
        complement:
          calculation.complement == undefined
            ? undefined
            : {
              dailySalary: calculation.complement.dailySalary,
              seniority: calculateSeniority(
                calculation.complement.entryDate,
                calculation.complement.calculationDate
              ),
              proportionalSettlementConcepts: {
                vacations:
                  this.proportionalCalculator.getProportionalVacationDays(
                    calculation.complement.entryDate,
                    calculation.complement.calculationDate
                  ),
                vacationBonus:
                  this.proportionalCalculator.getProportionalVacationBonus(
                    calculation.complement.entryDate,
                    calculation.complement.calculationDate,
                    calculation.benefitByLawConfiguration
                  ),
                christmasBonus:
                  this.proportionalCalculator.getProportionalChristmasBonus(
                    calculation.complement.entryDate,
                    calculation.complement.calculationDate,
                    calculation.benefitByLawConfiguration
                  ),
                pendingVacations: calculation.complement.pendingVacations,
                pendingVacationBonus:
                  calculation.complement.pendingVacationBonus,
              },
              proportionalSeveranceConcepts:
                calculation.isSeveranceCalculationEnabled
                  ? this.proportionalCalculator.getProportionalSeverance(
                    calculation.complement.entryDate,
                    calculation.complement.calculationDate
                  )
                  : defaultProportionalSeveranceConcepts,
            },
      };
    });

    return {
      results,
      metadatos: {
        totalCalculations: input.calculations.length,
        successfulCalculations: results.filter(
          (result) => result.status === "success"
        ).length,
        failedCalculations: results.filter(
          (result) => result.status === "error"
        ).length,
        calculationDate: new Date(),
      },
    };
  }
}

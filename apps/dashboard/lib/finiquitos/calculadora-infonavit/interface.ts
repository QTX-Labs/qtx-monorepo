import { InfonavitDailyCalculationValues } from "./models";

interface InfonavitCalculator {
    calculateInfonavitPayment(
        values: InfonavitDailyCalculationValues[],
        isInfonavitLimitDisabled: boolean
    ): number;
}

export type { InfonavitCalculator };

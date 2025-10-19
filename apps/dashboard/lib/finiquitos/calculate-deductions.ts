/**
 * Cálculo de deducciones para finiquitos
 */

import type { DeductionsCalculation } from './types';
import { round } from './utils';
import { DECIMAL_PRECISION } from './constants';
import { ISRCalculatorImpl } from './calculadora-isr/implementation';
import { ISRRates } from './calculadora-finiquitos/models';

export interface DeductionsInput {
    isrFiniquito?: number;
    isrArt174?: number;
    isrIndemnizacion?: number;
    subsidy?: number;
    infonavit?: number;
    fonacot?: number;
    other?: number;
}

export interface ISRCalculationInput {
    // Datos del empleado
    daysWorked: number;
    fiscalDailySalary: number;

    // Percepciones del finiquito
    workedDaysAmount: number;
    vacationAmount: number;
    pendingVacationAmount: number;
    aguinaldoAmount: number;
    vacationPremiumAmount: number;
    pendingPremiumAmount: number;

    // Indemnización (solo si está activa)
    severanceAmount?: number;
    seniorityPremiumAmount?: number;

    // Otras percepciones gravadas
    otherTaxablePerceptions?: number;
}

/**
 * Calcula las deducciones totales
 *
 * Nota: En la mayoría de los casos, las deducciones son $0
 * excepto ISR en columna fiscal si excede límites exentos
 */
export function calculateDeductions(input: DeductionsInput = {}): DeductionsCalculation {
    const {
        isrFiniquito = 0,
        isrArt174 = 0,
        isrIndemnizacion = 0,
        subsidy = 0,
        infonavit = 0,
        fonacot = 0,
        other = 0
    } = input;

    const totalDeductions = round(
        isrFiniquito + isrArt174 + isrIndemnizacion + subsidy + infonavit + fonacot + other,
        DECIMAL_PRECISION.MONEY
    );

    return {
        isrFiniquito: round(isrFiniquito, DECIMAL_PRECISION.MONEY),
        isrArt174: round(isrArt174, DECIMAL_PRECISION.MONEY),
        isrIndemnizacion: round(isrIndemnizacion, DECIMAL_PRECISION.MONEY),
        subsidy: round(subsidy, DECIMAL_PRECISION.MONEY),
        infonavit: round(infonavit, DECIMAL_PRECISION.MONEY),
        fonacot: round(fonacot, DECIMAL_PRECISION.MONEY),
        otherDeductions: round(other, DECIMAL_PRECISION.MONEY),
        totalDeductions
    };
}

/**
 * Calcula los 3 tipos de ISR para finiquitos
 *
 * - ISR Finiquito: Gravado sobre días trabajados, vacaciones, 7º día
 * - ISR Art 174: Gravado sobre aguinaldo y prima vacacional
 * - ISR Indemnización: Gravado sobre indemnización (solo si hay indemnización)
 */
export function calculateISRComplete(input: ISRCalculationInput): {
    isrFiniquito: number;
    isrArt174: number;
    isrIndemnizacion: number;
} {
    const isrCalculator = new ISRCalculatorImpl();

    // Helper para crear objetos Perception con base gravable = monto total (simplificado)
    const createPerception = (amount: number, quantity: number = 0): any => ({
        totalQuantity: quantity,
        totalTaxBase: amount, // Por ahora, todo es gravable (simplificado)
        totalExemptBase: 0,
        totalAmount: amount,
        detail: []
    });

    // 1. ISR Finiquito (días trabajados, vacaciones, 7º día)
    let isrFiniquito = 0;
    try {
        const resultFiniquito = isrCalculator.calcularISRFiniquito({
            diasTrabajados: createPerception(input.workedDaysAmount, input.daysWorked),
            septimoDia: createPerception(0, 0), // 7º día incluido en días trabajados
            vacaciones: createPerception(input.vacationAmount),
            vacacionesPendientes: createPerception(input.pendingVacationAmount),
            sueldoDiario: input.fiscalDailySalary,
            otrasPercepciones: [],
            tablaISR: TABLA_ISR_ANUAL,
        });
        isrFiniquito = resultFiniquito?.totalImpuesto || 0;
    } catch (error) {
        console.error('Error calculating ISR Finiquito:', error);
        isrFiniquito = 0;
    }

    // 2. ISR Art 174 (aguinaldo y prima vacacional)
    let isrArt174 = 0;
    try {
        const resultArt174 = isrCalculator.calcularISRArt174({
            aguinaldo: createPerception(input.aguinaldoAmount),
            primaVacacional: createPerception(input.vacationPremiumAmount),
            primaVacacionalPendiente: createPerception(input.pendingPremiumAmount),
            sueldoDiario: input.fiscalDailySalary,
            tablaISR: TABLA_ISR_ANUAL,
        });
        isrArt174 = resultArt174?.totalImpuesto || 0;
    } catch (error) {
        console.error('Error calculating ISR Art 174:', error);
        isrArt174 = 0;
    }

    // 3. ISR Indemnización (solo si hay indemnización)
    let isrIndemnizacion = 0;
    if ((input.severanceAmount || 0) > 0 || (input.seniorityPremiumAmount || 0) > 0) {
        try {
            const resultIndemnizacion = isrCalculator.calcularISRArt93({
                indemnizacionVeinteDias: createPerception(0), // Placeholder
                indemnizacionNoventaDias: createPerception(input.severanceAmount || 0),
                primaAntiguedad: createPerception(input.seniorityPremiumAmount || 0),
                sueldoDiario: input.fiscalDailySalary,
                tablaISR: TABLA_ISR_ANUAL,
            });
            isrIndemnizacion = resultIndemnizacion?.totalImpuesto || 0;
        } catch (error) {
            console.error('Error calculating ISR Indemnización:', error);
            isrIndemnizacion = 0;
        }
    }

    return {
        isrFiniquito: round(isrFiniquito, DECIMAL_PRECISION.MONEY),
        isrArt174: round(isrArt174, DECIMAL_PRECISION.MONEY),
        isrIndemnizacion: round(isrIndemnizacion, DECIMAL_PRECISION.MONEY),
    };
}

/**
 * Calcula ISR simplificado (legacy - mantener por compatibilidad)
 *
 * @deprecated Usar calculateISRComplete en su lugar
 */
export function calculateISR(totalPerceptions: number): number {
    if (totalPerceptions < 1000) {
        return round(0.50, DECIMAL_PRECISION.MONEY);
    }
    return 0;
}

const TABLA_ISR_ANUAL: ISRRates = {
    effectiveDate: new Date('2024-01-01'),
    rangeValues: [
        {
            "fixedFee": 0,
            "lowerLimit": 0.01,
            "upperLimit": 8952.49,
            "percentageOverSurplus": 1.92
        },
        {
            "fixedFee": 171.88,
            "lowerLimit": 8952.5,
            "upperLimit": 75984.55,
            "percentageOverSurplus": 6.4
        },
        {
            "fixedFee": 4461.94,
            "lowerLimit": 75984.56,
            "upperLimit": 133536.07,
            "percentageOverSurplus": 10.88
        },
        {
            "fixedFee": 10723.55,
            "lowerLimit": 133536.08,
            "upperLimit": 155229.8,
            "percentageOverSurplus": 16
        },
        {
            "fixedFee": 14194.54,
            "lowerLimit": 155229.81,
            "upperLimit": 185852.57,
            "percentageOverSurplus": 17.92
        },
        {
            "fixedFee": 19682.13,
            "lowerLimit": 185852.58,
            "upperLimit": 374837.88,
            "percentageOverSurplus": 21.36
        },
        {
            "fixedFee": 60049.4,
            "lowerLimit": 374837.89,
            "upperLimit": 590795.99,
            "percentageOverSurplus": 23.52
        },
        {
            "fixedFee": 110842.74,
            "lowerLimit": 590796,
            "upperLimit": 1127926.84,
            "percentageOverSurplus": 30
        },
        {
            "fixedFee": 271981.99,
            "lowerLimit": 1127926.85,
            "upperLimit": 1503902.46,
            "percentageOverSurplus": 32
        },
        {
            "fixedFee": 392294.17,
            "lowerLimit": 1503902.47,
            "upperLimit": 4511707.37,
            "percentageOverSurplus": 34
        },
        {
            "fixedFee": 1414947.85,
            "lowerLimit": 4511707.38,
            "upperLimit": 999999999,
            "percentageOverSurplus": 35
        }
    ]

}

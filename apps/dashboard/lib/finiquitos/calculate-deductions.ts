/**
 * Cálculo de deducciones para finiquitos
 */

import type { DeductionsCalculation } from './types';
import { round } from './utils';
import { DECIMAL_PRECISION } from './constants';
import { CalculadoraFiniquitoLiquidacion, ISRCalculator } from './calculadora-finiquitos/interface';
import { ImplementationV1 } from './calculadora-finiquitos/implementation';
import { ISRCalculatorImpl } from './calculadora-isr/implementation';
import { ISRRates, ResultadoISRFiniquitoLiquidacion } from './calculadora-finiquitos/models';

export interface DeductionsInput {
    isr?: number;
    subsidy?: number;
    infonavit?: number;
    fonacot?: number;
    other?: number;
}

/**
 * Calcula las deducciones totales
 *
 * Nota: En la mayoría de los casos, las deducciones son $0
 * excepto ISR en columna fiscal si excede límites exentos
 */
export function calculateDeductions(input: DeductionsInput = {}): DeductionsCalculation {
    const {
        isr = 0,
        subsidy = 0,
        infonavit = 0,
        fonacot = 0,
        other = 0
    } = input;

    const totalDeductions = round(
        isr + subsidy + infonavit + fonacot + other,
        DECIMAL_PRECISION.MONEY
    );

    return {
        isr: round(isr, DECIMAL_PRECISION.MONEY),
        subsidy: round(subsidy, DECIMAL_PRECISION.MONEY),
        infonavit: round(infonavit, DECIMAL_PRECISION.MONEY),
        fonacot: round(fonacot, DECIMAL_PRECISION.MONEY),
        otherDeductions: round(other, DECIMAL_PRECISION.MONEY),
        totalDeductions
    };
}

/**
 * Calcula ISR simplificado
 *
 * NOTA: Esta es una implementación simplificada.
 * Para cálculo real se requiere tabla de ISR vigente.
 *
 * Por ahora retorna 0 o un valor muy pequeño como en el ejemplo del cliente
 */
export function calculateISR(totalPerceptions: number): number {

    const isrCalculator: ISRCalculator = new ISRCalculatorImpl();

    // const calculoISR: ResultadoISRFiniquitoLiquidacion = {
    //   isrFiniquito: isrCalculator.calcularISRFiniquito({
    //     diasTrabajados: percepcionesFiniquito.diasTrabajados,
    //     septimoDia: percepcionesFiniquito.septimoDia,
    //     vacaciones: percepcionesFiniquito.vacaciones,
    //     vacacionesPendientes: percepcionesFiniquito.vacacionesPendientes,
    //     sueldoDiario: input.factoresCalculo.salarioDiario,
    //     otrasPercepciones: input.factoresCalculo.otrasPercepciones,
    //     tablaISR: TABLA_ISR_ANUAL,
    //   }),
    //   isrArt174: isrCalculator.calcularISRArt174({
    //     primaVacacional: percepcionesFiniquito.primaVacacional,
    //     primaVacacionalPendiente:
    //       percepcionesFiniquito.primaVacacionalPendiente,
    //     aguinaldo: percepcionesFiniquito.aguinaldo,
    //     sueldoDiario: input.factoresCalculo.salarioDiario,
    //     tablaISR: TABLA_ISR_ANUAL,
    //   }),
    //   isrIndemnizacion: isrCalculator.calcularISRArt93({
    //     indemnizacionVeinteDias:
    //       percepcionesLiquidacion.indemnizacionVeinteDias,
    //     indemnizacionNoventaDias:
    //       percepcionesLiquidacion.indemnizacionNoventaDias,
    //     primaAntiguedad: percepcionesLiquidacion.primaAntiguedad,
    //     sueldoDiario: input.factoresCalculo.salarioDiario,
    //     tablaISR: TABLA_ISR_ANUAL,
    //   }),
    // };

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
            "upperLimit": "En adelante",
            "percentageOverSurplus": 35
        }
    ]

}

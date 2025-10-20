import { BigCalculatorImpl } from "../calculadora-finiquitos/calculadora";
import { FilterByRangeValues, GetRangeValuesIndex } from "../calculadora-finiquitos/generics";
import { ICalculator, ISRCalculator } from "../calculadora-finiquitos/interface";
import { CalculationType, CalculoIMSS, CalculoISN, CalculoISR, Concepto, Frequency, InputISRArt154, InputISRArt174, InputISRFiniquito, ISRArt174Result, ISRDailyCalculationValues, ISRDetail, ISRRangeValues, ISRResult, ISRReversaResult, PerceptionsResult, SubsidyRangeValues } from "../calculadora-finiquitos/models";
import { DEFAULT_DAYS_FACTOR } from "../constants";

type FactoresCalculoInvertido = {
  sueldoBruto: number;
  montoSubsidio: number;
  indiceTablaISR: number;
};

class ISRCalculatorImpl implements ISRCalculator {
  calculoISRReversa(montoCalculoInvertido: number, imssEmpleado: number, values: ISRDailyCalculationValues[], frequency: Frequency, accumulatedMonthlyISR: ISRResult[], isLastPeriod: boolean): ISRReversaResult {
    throw new Error("Method not implemented.");
  }
  calculateISR(
    values: ISRDailyCalculationValues[],
    otrasPercepciones: Concepto[],
    frequency: Frequency,
    accumulatedMonthlyISR: ISRResult[],
    isLastPeriod: boolean
  ): ISRResult {
    const detail: ISRDetail[] = [];
    const totalImpuesto: ICalculator = new BigCalculatorImpl(0);
    let diasTrabajados: ICalculator = new BigCalculatorImpl(0);
    const taxBase: ICalculator = new BigCalculatorImpl(0);
    const totalPercepciones: ICalculator = new BigCalculatorImpl(0);
    const totalPercepcionesAcumuladas: ICalculator = new BigCalculatorImpl(0);
    const totalSubsidio: ICalculator = new BigCalculatorImpl(0);
    let subsidyRangeValue: SubsidyRangeValues | void = undefined;
    const septimoDia: ICalculator = new BigCalculatorImpl(
      values[0].perceptions.septimoDia?.totalQuantity || 0
    );

    diasTrabajados.add(values[0].perceptions.diasLaborados?.totalQuantity || 0);
    diasTrabajados.add(values[0].perceptions.vacaciones?.totalQuantity || 0);
    diasTrabajados.add(septimoDia.result);
    diasTrabajados.add(
      values[0].perceptions.retroactivoSueldo?.totalQuantity || 0
    );

    if (diasTrabajados.result == 0) {
      switch (frequency) {
        case Frequency.Semanal:
          diasTrabajados = new BigCalculatorImpl(7);
          break;
        case Frequency.Decenal:
          diasTrabajados = new BigCalculatorImpl(10);
          break;
        case Frequency.Quincenal:
          diasTrabajados = new BigCalculatorImpl(15);
          break;
        case Frequency.Mensual:
          diasTrabajados = new BigCalculatorImpl(30);
          break;
      }
    }

    taxBase
      .add(values[0].perceptions.diasLaborados?.totalTaxBase || 0)
      .add(values[0].perceptions.vacaciones?.totalTaxBase || 0)
      .add(values[0].perceptions.primaVacacional?.totalTaxBase || 0)
      .add(values[0].perceptions.domingosLaborados?.totalTaxBase || 0)
      .add(values[0].perceptions.primaDominical?.totalTaxBase || 0)
      .add(values[0].perceptions.descansosLaborados?.totalTaxBase || 0)
      .add(values[0].perceptions.festivosLaborados?.totalTaxBase || 0)
      .add(values[0].perceptions.horasExtrasDobles?.totalTaxBase || 0)
      .add(values[0].perceptions.horasExtrasTriples?.totalTaxBase || 0)
      .add(values[0].perceptions.septimoDia?.totalTaxBase || 0)
      .add(values[0].perceptions.retroactivoSueldo?.totalTaxBase || 0);

    totalPercepciones
      .add(values[0].perceptions.diasLaborados?.totalAmount || 0)
      .add(values[0].perceptions.vacaciones?.totalAmount || 0)
      .add(values[0].perceptions.primaVacacional?.totalAmount || 0)
      .add(values[0].perceptions.domingosLaborados?.totalAmount || 0)
      .add(values[0].perceptions.primaDominical?.totalAmount || 0)
      .add(values[0].perceptions.descansosLaborados?.totalAmount || 0)
      .add(values[0].perceptions.festivosLaborados?.totalAmount || 0)
      .add(values[0].perceptions.horasExtrasDobles?.totalAmount || 0)
      .add(values[0].perceptions.horasExtrasTriples?.totalAmount || 0)
      .add(values[0].perceptions.septimoDia?.totalAmount || 0)
      .add(values[0].perceptions.retroactivoSueldo?.totalAmount || 0);

    otrasPercepciones.forEach((otraPercepcion) => {
      if (otraPercepcion.pagoEnEfectivo) {
        return;
      }

      if (otraPercepcion.calculoISR !== CalculoISR.Exento) {
        taxBase.add(otraPercepcion.monto || 0);
      }

      totalPercepciones.add(otraPercepcion.monto || 0);
    });

    let tableISRFinal: ISRRangeValues[] = this.calcularRangoRetencionDiario(
      values[0].isrRates.rangeValues,
      diasTrabajados.result
    );

    let tableSubsidioFinal: SubsidyRangeValues[] =
      this.calcularRangoSubsidioDiario(
        values[0].subsidyRates.rangeValues,
        diasTrabajados.result
      );

    if (frequency == "Mensual") {
      tableISRFinal = values[0].isrRates.rangeValues;
      tableSubsidioFinal = values[0].subsidyRates.rangeValues;
    }

    if (isLastPeriod) {
      tableSubsidioFinal = values[0].subsidyRates.rangeValues;
      accumulatedMonthlyISR.forEach((accumulatedISR) => {
        accumulatedISR.detail.forEach((d) => {
          totalPercepcionesAcumuladas.add(d.baseGravable);
          totalSubsidio.add(d.subsidio);
        });
      });
    }

    const isrRangeValue = FilterByRangeValues(tableISRFinal, taxBase.value);
    subsidyRangeValue = FilterByRangeValues(
      tableSubsidioFinal,
      taxBase.result + totalPercepcionesAcumuladas.result
    );
    let subsidyAmount: ICalculator = new BigCalculatorImpl(
      subsidyRangeValue?.subsidyAmount || 0
    );
    if (subsidyAmount.result > 0) {
      subsidyAmount.subtract(totalSubsidio.result);
    }

    const baseImponible: ICalculator = new BigCalculatorImpl(
      taxBase.value
    ).subtract(isrRangeValue?.lowerLimit || 0);
    const impuestoPrevio: ICalculator = new BigCalculatorImpl(
      baseImponible.value
    ).percentage(isrRangeValue?.percentageOverSurplus || 100);
    const isrAntesSubsidio: ICalculator = new BigCalculatorImpl(
      impuestoPrevio.value
    ).add(isrRangeValue?.fixedFee || 0);
    if (subsidyAmount.result > isrAntesSubsidio.result) {
      subsidyAmount = new BigCalculatorImpl(isrAntesSubsidio.result);
    }

    let impuesto: ICalculator = new BigCalculatorImpl(
      isrAntesSubsidio.result
    ).subtract(subsidyAmount.result);
    if (impuesto.result < 0) {
      impuesto = new BigCalculatorImpl(0);
    }
    totalImpuesto.add(impuesto.value);

    detail.push({
      isrRangeValue: isrRangeValue || undefined,
      subsidyRangeValue: subsidyRangeValue || undefined,
      totalPercepciones: totalPercepciones.result,
      baseGravable: taxBase.value,
      baseImponible: baseImponible.result,
      impuestoPrevio: impuestoPrevio.result,
      subsidio: subsidyAmount.result,
      isrAntesSubsidio: isrAntesSubsidio.result,
      impuesto: impuesto.result,
    });

    return {
      detail,
      totalImpuesto: totalImpuesto.result,
      isrPeriodo: totalImpuesto.result,
    };
  }

  // calculoISRReversa(
  //   montoCalculoInvertido: number,
  //   imssEmpleado: number,
  //   values: ISRDailyCalculationValues[],
  //   frequency: Frequency,
  //   accumulatedMonthlyISR: ISRResult[],
  //   isLastPeriod: boolean,
  //   conceptsConfigurationKeys?: ConceptsConfigurationKeys
  // ): ISRReversaResult {
  //   const sueldoObjetivo: ICalculator = new BigCalculatorImpl(
  //     montoCalculoInvertido
  //   )
  //     .add(imssEmpleado)
  //     .add(values[0].perceptions.fondoAhorro?.totalAmount || 0);
  //   const baseExenta: ICalculator = new BigCalculatorImpl(0);
  //   const percepcionesAcumuladas: ICalculator = new BigCalculatorImpl(0);
  //   const subsidioAcumulado: ICalculator = new BigCalculatorImpl(0);
  //   const baseCalculoSubsidio: ICalculator = new BigCalculatorImpl(
  //     sueldoObjetivo.result
  //   );
  //   const baseGravableInicial: ICalculator = new BigCalculatorImpl(0);
  //   let diasTrabajados: ICalculator = new BigCalculatorImpl(0);
  //   // TODO: solo aplica para nomina 5Torres
  //   const conceptosCalculoInvertido: string[] = [
  //     "diasLaborados",
  //     "septimoDia",
  //     "vacaciones",
  //   ];

  //   for (const perception in values[0].perceptions) {
  //     if (perception === "fondoAhorro") {
  //       continue;
  //     }

  //     if (!conceptosCalculoInvertido.includes(perception)) {
  //       continue;
  //     }

  //     const totalQuantity =
  //       perception === "diasLaborados" ||
  //       perception === "septimoDia" ||
  //       perception === "vacaciones"
  //         ? values[0].perceptions[perception as keyof PerceptionsResult]
  //             ?.totalQuantity
  //         : 0;
  //     const totalExemptBase =
  //       values[0].perceptions[perception as keyof PerceptionsResult]
  //         ?.totalExemptBase;
  //     const totalTaxBase =
  //       values[0].perceptions[perception as keyof PerceptionsResult]
  //         ?.totalTaxBase;
  //     diasTrabajados.add(totalQuantity || 0);
  //     baseExenta.add(totalExemptBase || 0);
  //     baseGravableInicial.add(totalTaxBase || 0);
  //   }
  //   // TODO: solo dejar comentar para nomina 5Torres
  //   // values[0].otrasPercepciones.forEach((otraPercepcion) => {
  //   //   if (otraPercepcion.calculoISR !== CalculoISR.Exento) {
  //   //     baseGravableInicial.add(otraPercepcion.monto || 0);
  //   //   } else {
  //   //     baseExenta.add(otraPercepcion.monto || 0);
  //   //   }
  //   // });

  //   sueldoObjetivo.subtract(baseExenta.result);

  //   let tableISRFinal: ISRRangeValues[] = this.calcularRangoRetencionDiario(
  //     values[0].isrRates.rangeValues,
  //     diasTrabajados.result
  //   );

  //   let tableSubsidioFinal: SubsidyRangeValues[] =
  //     this.calcularRangoSubsidioDiario(
  //       values[0].subsidyRates.rangeValues,
  //       diasTrabajados.result
  //     );

  //   if (frequency == "Mensual") {
  //     tableISRFinal = values[0].isrRates.rangeValues;
  //     tableSubsidioFinal = values[0].subsidyRates.rangeValues;
  //   }
  //   if (isLastPeriod) {
  //     tableSubsidioFinal = values[0].subsidyRates.rangeValues;
  //     accumulatedMonthlyISR.forEach((accumulatedISR) => {
  //       accumulatedISR.detail.forEach((d) => {
  //         percepcionesAcumuladas.add(d.totalPercepciones);
  //         subsidioAcumulado.add(d.subsidio);
  //       });
  //     });
  //   }

  //   const firstISRRangeIndex = GetRangeValuesIndex(
  //     tableISRFinal,
  //     sueldoObjetivo.result
  //   );
  //   if (firstISRRangeIndex == undefined) {
  //     throw new Error("No se encontró el rango de ISR");
  //   }

  //   const subsidyRangeValue = FilterByRangeValues(
  //     tableSubsidioFinal,
  //     baseCalculoSubsidio.result + percepcionesAcumuladas.result
  //   );
  //   let subsidyAmount: ICalculator = new BigCalculatorImpl(
  //     subsidyRangeValue?.subsidyAmount || 0
  //   );
  //   if (subsidyAmount.result > 0) {
  //     subsidyAmount.subtract(subsidioAcumulado.result);
  //   }

  //   const factoresCalculoInvertido = this.obtenerFactoresCalculoISR(
  //     sueldoObjetivo.result,
  //     subsidyAmount.result,
  //     baseExenta.result,
  //     percepcionesAcumuladas.result,
  //     subsidioAcumulado.result,
  //     tableISRFinal,
  //     tableSubsidioFinal,
  //     firstISRRangeIndex
  //   );

  //   let concepto: string =
  //     ConceptsConfigurationMap[ConceptsConfigurationKeys.Gratificacion_P];
  //   if (conceptsConfigurationKeys) {
  //     concepto = ConceptsConfigurationMap[conceptsConfigurationKeys];
  //   }

  //   const detalleISR = this.calcularDetalleISR(
  //     factoresCalculoInvertido.sueldoBruto,
  //     tableISRFinal[factoresCalculoInvertido.indiceTablaISR],
  //     factoresCalculoInvertido.montoSubsidio
  //   );
  //   const montoConceptoCalculoInvertido: ICalculator = new BigCalculatorImpl(
  //     detalleISR.baseGravable
  //   ).subtract(baseGravableInicial.result);

  //   const conceptoCalculoInvertido: Concepto = {
  //     conceptoFacturacion: concepto,
  //     conceptoVisual: concepto,
  //     monto: montoConceptoCalculoInvertido.result,
  //     calculoISR: CalculoISR.Gravado,
  //     calculoISN: CalculoISN.Gravado,
  //     calculoIMSS: CalculoIMSS.Gravado,
  //   };

  //   const result: ISRReversaResult = {
  //     isrResult: {
  //       detail: [detalleISR],
  //       totalImpuesto: detalleISR.impuesto,
  //       isrPeriodo: detalleISR.impuesto,
  //     },
  //     conceptoCalculoInvertido: conceptoCalculoInvertido,
  //   };

  //   return result;
  // }

  private obtenerFactoresCalculoISR(
    sueldoObjetivo: number,
    subsidioCalculado: number,
    baseExenta: number,
    totalPercepcionesAcumuladas: number,
    totalSubsidio: number,
    tableISRFinal: ISRRangeValues[],
    tablaSubsidioFinal: SubsidyRangeValues[],
    rangeIndex: number
  ): FactoresCalculoInvertido {
    const lastIndex: number = tableISRFinal.length - 1;
    const limiteSuperior: number = tableISRFinal[rangeIndex].upperLimit;
    const sueldoObjetivoCalculado: ICalculator = new BigCalculatorImpl(
      sueldoObjetivo
    ).subtract(subsidioCalculado);

    let sueldoBruto: number = this.calcularSueldoBruto(
      sueldoObjetivoCalculado.result,
      tableISRFinal[rangeIndex]
    );

    const subsidyRangeValue = FilterByRangeValues(
      tablaSubsidioFinal,
      sueldoBruto + totalPercepcionesAcumuladas
    );
    const subsidyAmount: ICalculator = new BigCalculatorImpl(
      subsidyRangeValue?.subsidyAmount || 0
    );
    if (subsidyAmount.result > 0) {
      subsidyAmount.subtract(totalSubsidio);
    }
    if (subsidioCalculado != subsidyAmount.result) {
      sueldoObjetivoCalculado
        .add(subsidioCalculado)
        .subtract(subsidyAmount.result);
      sueldoBruto = this.calcularSueldoBruto(
        sueldoObjetivoCalculado.result,
        tableISRFinal[rangeIndex]
      );
    }

    let result: FactoresCalculoInvertido = {
      sueldoBruto: sueldoBruto,
      montoSubsidio: subsidyAmount.result,
      indiceTablaISR: rangeIndex,
    };

    if (limiteSuperior < sueldoBruto && rangeIndex < lastIndex) {
      const nextRangeIndex: number = rangeIndex + 1;
      result = this.obtenerFactoresCalculoISR(
        sueldoObjetivoCalculado.result,
        subsidyAmount.result,
        baseExenta,
        totalPercepcionesAcumuladas,
        totalSubsidio,
        tableISRFinal,
        tablaSubsidioFinal,
        nextRangeIndex
      );
    }

    return result;
  }

  private calcularSueldoBruto(
    sueldoObjetivo: number,
    rangoTablaISR: ISRRangeValues
  ): number {
    const operationDecimals = 4;
    const tasaDecimal: ICalculator = new BigCalculatorImpl(
      rangoTablaISR.percentageOverSurplus,
      operationDecimals
    ).divide(100);
    const tasaDecimalInvertida: ICalculator = new BigCalculatorImpl(
      1,
      operationDecimals
    ).subtract(tasaDecimal.value);
    const limiteInferior: ICalculator = new BigCalculatorImpl(
      rangoTablaISR.lowerLimit,
      operationDecimals
    ).multiply(tasaDecimal.value);
    const resultado: ICalculator = new BigCalculatorImpl(
      sueldoObjetivo,
      operationDecimals
    )
      .subtract(limiteInferior.value)
      .add(rangoTablaISR.fixedFee)
      .divide(tasaDecimalInvertida.value);

    return resultado.result;
  }

  calculateMonthlyAdjustment(
    values: ISRDailyCalculationValues[],
    isr: ISRResult,
    accumulatedMonthlyISR: ISRResult[],
    perceptions: PerceptionsResult,
    accumulatedPerceptions: PerceptionsResult[]
  ): ISRResult {
    const detail: ISRDetail[] = [];
    const totalImpuesto: ICalculator = new BigCalculatorImpl(0);
    const totalImpuestoAntesSubsidio: ICalculator = new BigCalculatorImpl();
    const totalSubsidio: ICalculator = new BigCalculatorImpl();
    const totalImpuestoAcumulado: ICalculator = new BigCalculatorImpl(
      isr.totalImpuesto
    );
    const reintegroISRRetenidoDeMas: ICalculator = new BigCalculatorImpl(0);
    const ajusteISRPeriodo: ICalculator = new BigCalculatorImpl(0);
    const ajusteSubsidioCausado: ICalculator = new BigCalculatorImpl(0);
    const diasTrabajados = DEFAULT_DAYS_FACTOR;
    const taxBase: ICalculator = new BigCalculatorImpl();
    const totalPercepciones: ICalculator = new BigCalculatorImpl();
    let subsidyRangeValue: SubsidyRangeValues | void = undefined;

    isr.detail.forEach((detail) => {
      taxBase.add(detail.baseGravable);
      totalImpuestoAntesSubsidio.add(detail.isrAntesSubsidio);
      totalSubsidio.add(detail.subsidio);
    });

    accumulatedMonthlyISR.forEach((isr) => {
      isr.detail.forEach((detail) => {
        taxBase.add(detail.baseGravable);
        totalImpuestoAntesSubsidio.add(detail.isrAntesSubsidio);
        totalSubsidio.add(detail.subsidio);
      });

      totalImpuestoAcumulado.add(isr.totalImpuesto);
    });

    for (const perception in perceptions) {
      totalPercepciones.add(
        perceptions[perception as keyof PerceptionsResult]?.totalAmount || 0
      );
    }

    accumulatedPerceptions.forEach((accumulated) => {
      for (const perception in accumulated) {
        totalPercepciones.add(
          accumulated[perception as keyof PerceptionsResult]?.totalAmount || 0
        );
      }
    });

    const isrRangeValue = FilterByRangeValues(
      values[0].isrRates.rangeValues,
      taxBase.value
    );
    subsidyRangeValue = FilterByRangeValues(
      values[0].subsidyRates.rangeValues,
      totalPercepciones.result
    );
    const subsidyAmount = subsidyRangeValue?.subsidyAmount || 0;

    const baseImponible: ICalculator = new BigCalculatorImpl(
      taxBase.value
    ).subtract(isrRangeValue?.lowerLimit || 0);
    const impuestoPrevio: ICalculator = new BigCalculatorImpl(
      baseImponible.value
    ).percentage(isrRangeValue?.percentageOverSurplus || 100);
    const isrAntesSubsidio: ICalculator = new BigCalculatorImpl(
      impuestoPrevio.value
    ).add(isrRangeValue?.fixedFee || 0);
    // if (subsidyAmount > isrAntesSubsidio.result) {
    //   subsidyAmount = isrAntesSubsidio.result;
    // }
    let impuesto: ICalculator = new BigCalculatorImpl(
      isrAntesSubsidio.result
    ).subtract(subsidyAmount);
    if (impuesto.result < 0) {
      impuesto = new BigCalculatorImpl(0);
    }
    totalImpuesto.add(impuesto.value);

    if (totalSubsidio.result > 0 && subsidyRangeValue == undefined) {
      reintegroISRRetenidoDeMas
        .add(totalImpuestoAntesSubsidio.result)
        .subtract(totalImpuesto.result);

      ajusteSubsidioCausado.add(totalSubsidio.result);
    } else if (totalImpuestoAcumulado.result > totalImpuesto.result) {
      reintegroISRRetenidoDeMas
        .add(totalImpuestoAcumulado.result)
        .subtract(totalImpuesto.result);
    } else {
      ajusteISRPeriodo
        .add(totalImpuesto.result)
        .subtract(totalImpuestoAcumulado.result);
    }

    let reintegroISRRetenidoDeMasEfectivo: ICalculator = new BigCalculatorImpl(
      reintegroISRRetenidoDeMas.result
    );
    if (reintegroISRRetenidoDeMasEfectivo.result > isr.totalImpuesto) {
      reintegroISRRetenidoDeMasEfectivo = new BigCalculatorImpl(
        isr.totalImpuesto
      );
    }

    detail.push({
      isrRangeValue: isrRangeValue || undefined,
      subsidyRangeValue: subsidyRangeValue || undefined,
      totalPercepciones: totalPercepciones.result,
      baseGravable: taxBase.result,
      baseImponible: baseImponible.result,
      impuestoPrevio: impuestoPrevio.result,
      subsidio: subsidyRangeValue?.subsidyAmount || 0,
      isrAntesSubsidio: isrAntesSubsidio.result,
      impuesto: impuesto.result,
    });

    return {
      detail,
      isrRetenidoDeMenos: ajusteISRPeriodo.result,
      reintegroISRRetenidoDeMas: reintegroISRRetenidoDeMas.result,
      reintegroISRRetenidoDeMasEfectivo:
        reintegroISRRetenidoDeMasEfectivo.result,
      ajusteSubsidioCausado: ajusteSubsidioCausado.result,
      totalImpuesto: totalImpuesto.result,
      isrPeriodo: isr.isrPeriodo,
    };
  }

  calcularISRFiniquito(input: InputISRFiniquito): ISRResult {
    const septimoDia = Math.ceil(input.septimoDia.totalQuantity);
    const montoGravado: ICalculator = new BigCalculatorImpl(
      input.diasTrabajados.totalTaxBase
    )
      .add(input.vacaciones.totalTaxBase)
      .add(input.vacacionesPendientes.totalTaxBase)
      .add(input.septimoDia.totalTaxBase);

    input.otrasPercepciones.forEach((otraPercepcion) => {
      if (otraPercepcion.calculoISR != CalculoISR.Exento) {
        montoGravado.add(otraPercepcion.monto);
      }
    });

    const diasCalculo: ICalculator = new BigCalculatorImpl(
      input.diasTrabajados.totalQuantity
    )
      .add(septimoDia)
      .add(input.vacaciones.totalQuantity)
      .add(input.vacacionesPendientes.totalQuantity);
    if (montoGravado.value == 0) {
      return {
        detail: [],
        totalImpuesto: 0,
        isrPeriodo: 0,
      };
    }

    const tableISRFinal: ISRRangeValues[] = this.calcularRangoRetencionDiario(
      input.tablaISR.rangeValues,
      diasCalculo.result
    );

    const isrRangeValue = FilterByRangeValues(
      tableISRFinal,
      montoGravado.value
    );
    if (isrRangeValue == undefined) {
      return {
        detail: [],
        totalImpuesto: 0,
        isrPeriodo: 0,
      };
    }

    const detalleCalculoISR = this.calcularDetalleISR(
      montoGravado.value,
      isrRangeValue
    );
    const result: ISRResult = {
      detail: [detalleCalculoISR],
      totalImpuesto: detalleCalculoISR.impuesto,
      isrPeriodo: detalleCalculoISR.impuesto,
    };

    return result;
  }

  calcularISRArt174(input: InputISRArt174): ISRArt174Result | void {
    const diasAnio = 365;
    let diasMes = DEFAULT_DAYS_FACTOR;

    if (input.calculationType === CalculationType.AGUINALDO) {
      switch (input.frecuencia) {
        case Frequency.Semanal:
          diasMes = DEFAULT_DAYS_FACTOR;
          break;
        case Frequency.Mensual:
          diasMes = DEFAULT_DAYS_FACTOR;
          break;
        default:
          diasMes = 30;
      }
    }

    const gravadoAguinaldoPrimavacacional: ICalculator = new BigCalculatorImpl(
      input.aguinaldo.totalTaxBase
    )
      .add(input.primaVacacional.totalTaxBase)
      .add(input.primaVacacionalPendiente.totalTaxBase);
    const fraccionUno: ICalculator = new BigCalculatorImpl(
      gravadoAguinaldoPrimavacacional.result
    )
      .divide(diasAnio)
      .multiply(DEFAULT_DAYS_FACTOR);
    const sueldoMesualOrdinario: ICalculator = new BigCalculatorImpl(
      input.sueldoDiario
    ).multiply(diasMes);
    const fraccionDos: ICalculator = new BigCalculatorImpl(
      fraccionUno.value
    ).add(sueldoMesualOrdinario.value);
    if (fraccionUno.value == 0) {
      return;
    }

    const rangoFraccionDos = FilterByRangeValues(
      input.tablaISR.rangeValues,
      fraccionDos.result
    );
    if (rangoFraccionDos == undefined) {
      return;
    }

    const rangoSueldoMensual = FilterByRangeValues(
      input.tablaISR.rangeValues,
      sueldoMesualOrdinario.result
    );
    if (rangoSueldoMensual == undefined) {
      return;
    }

    const isrFraccionDos = this.calcularDetalleISR(
      fraccionDos.result,
      rangoFraccionDos
    );
    const isrSueldoMensual = this.calcularDetalleISR(
      sueldoMesualOrdinario.result,
      rangoSueldoMensual
    );

    const fraccionTres: ICalculator = new BigCalculatorImpl(
      isrFraccionDos.impuesto
    ).subtract(isrSueldoMensual.impuesto);
    const factor: ICalculator = new BigCalculatorImpl(fraccionTres.result, 4)
      .divide(fraccionUno.result)
      .multiply(100);
    const totalImpuesto: ICalculator = new BigCalculatorImpl(
      gravadoAguinaldoPrimavacacional.result
    ).percentage(factor.value);

    const result: ISRArt174Result = {
      salarioDiario: input.sueldoDiario,
      sueldoMesualOrinario: sueldoMesualOrdinario.result,
      baseGravable: {
        aguinaldo: input.aguinaldo.totalTaxBase,
        primaVacacional: input.primaVacacional.totalTaxBase,
        primaVacacionalPendiente: input.primaVacacionalPendiente.totalTaxBase,
        total: gravadoAguinaldoPrimavacacional.result,
      },
      fraccionUno: fraccionUno.result,
      fraccionDos: fraccionDos.result,
      fraccionTres: fraccionTres.result,
      factor: factor.result,
      calculoISRBaseGravableSueldoMesual: isrFraccionDos,
      calculoISRSueldoMensual: isrSueldoMensual,
      totalImpuesto: totalImpuesto.result,
    };

    return result;
  }

  calcularISRArt93(input: InputISRArt154): ISRResult {
    const montoGravado: ICalculator = new BigCalculatorImpl(
      input.indemnizacionVeinteDias.totalTaxBase
    )
      .add(input.indemnizacionNoventaDias.totalTaxBase)
      .add(input.primaAntiguedad.totalTaxBase);
    const sueldoMesualOrdinario: ICalculator = new BigCalculatorImpl(
      input.sueldoDiario
    ).multiply(DEFAULT_DAYS_FACTOR);
    if (montoGravado.value == 0) {
      return {
        detail: [],
        totalImpuesto: 0,
        isrPeriodo: 0,
      };
    }

    const rangoSueldoMensual = FilterByRangeValues(
      input.tablaISR.rangeValues,
      sueldoMesualOrdinario.result
    );
    if (rangoSueldoMensual == undefined) {
      return {
        detail: [],
        totalImpuesto: 0,
        isrPeriodo: 0,
      };
    }

    const isrSueldoMensual = this.calcularDetalleISR(
      sueldoMesualOrdinario.result,
      rangoSueldoMensual
    );
    const tasa: ICalculator = new BigCalculatorImpl(
      isrSueldoMensual.impuesto,
      5
    ).divide(sueldoMesualOrdinario.result);
    const totalImpuesto: ICalculator = new BigCalculatorImpl(
      tasa.value
    ).multiply(montoGravado.value);
    const result: ISRResult = {
      detail: [isrSueldoMensual],
      totalImpuesto: totalImpuesto.result,
      isrPeriodo: totalImpuesto.result,
    };

    return result;
  }

  private calcularDetalleISR(
    baseGravada: number,
    rangoTablaISR: ISRRangeValues,
    montoSubsidio?: number
  ): ISRDetail {
    const baseImponible: ICalculator = new BigCalculatorImpl(
      baseGravada
    ).subtract(rangoTablaISR.lowerLimit);
    const impuestoPrevio: ICalculator = new BigCalculatorImpl(
      baseImponible.value
    ).percentage(rangoTablaISR.percentageOverSurplus);
    const isrAntesSubsidio: ICalculator = new BigCalculatorImpl(
      impuestoPrevio.value
    ).add(rangoTablaISR.fixedFee);
    const impuesto: ICalculator = new BigCalculatorImpl(
      isrAntesSubsidio.value
    ).subtract(montoSubsidio || 0);

    const result: ISRDetail = {
      isrRangeValue: rangoTablaISR,
      totalPercepciones: 0,
      baseGravable: baseGravada,
      baseImponible: baseImponible.result,
      impuestoPrevio: impuestoPrevio.result,
      subsidio: montoSubsidio || 0,
      isrAntesSubsidio: isrAntesSubsidio.result,
      impuesto: impuesto.result,
    };

    return result;
  }

  private calcularRangoRetencionDiario = (
    ranges: ISRRangeValues[],
    diasTrabajados: number
  ): ISRRangeValues[] => {
    const rangesTemp: ISRRangeValues[] = [];
    const firstIndex = 0;
    const lastIndex = ranges.length - 1;

    ranges.forEach((range, index) => {
      let limiteInferiorValue = 0.01;
      let limiteSuperiorValue = 0.0;
      let cuotaFijaValue = 0.0;

      if (index > firstIndex) {
        const limiteInferior: ICalculator = new BigCalculatorImpl(
          rangesTemp[index - 1].upperLimit
        ).add(0.01);
        const cuotaFija: ICalculator = new BigCalculatorImpl(range.fixedFee)
          .divide(DEFAULT_DAYS_FACTOR)
          .multiply(diasTrabajados);

        limiteInferiorValue = limiteInferior.result;
        cuotaFijaValue = cuotaFija.result;
      }

      if (index < lastIndex) {
        const limiteSuperior: ICalculator = new BigCalculatorImpl(
          range.upperLimit
        )
          .divide(DEFAULT_DAYS_FACTOR)
          .multiply(diasTrabajados);
        limiteSuperiorValue = limiteSuperior.result;
      }

      rangesTemp.push({
        lowerLimit: limiteInferiorValue,
        upperLimit: limiteSuperiorValue,
        fixedFee: cuotaFijaValue,
        percentageOverSurplus: range.percentageOverSurplus,
      });
    });

    return rangesTemp;
  };

  private calcularRangoSubsidioDiario = (
    ranges: SubsidyRangeValues[],
    diasTrabajados: number
  ): SubsidyRangeValues[] => {
    const rangesTemp: SubsidyRangeValues[] = [];

    ranges.forEach((range, index) => {
      let limiteInferiorValue = 0.01;
      const limiteSuperior: ICalculator = new BigCalculatorImpl(
        range.upperLimit
      )
        .divide(DEFAULT_DAYS_FACTOR)
        .multiply(diasTrabajados);
      const subsidyAmount: ICalculator = new BigCalculatorImpl(
        range.subsidyAmount
      )
        .divide(DEFAULT_DAYS_FACTOR)
        .multiply(diasTrabajados);

      if (index > 0 && index != ranges.length - 1) {
        limiteInferiorValue = rangesTemp[index - 1].upperLimit - 0.01;
      }

      rangesTemp.push({
        lowerLimit: limiteInferiorValue,
        upperLimit: limiteSuperior.result,
        subsidyAmount: subsidyAmount.result,
      });
    });

    return rangesTemp;
  };
}

export { ISRCalculatorImpl };

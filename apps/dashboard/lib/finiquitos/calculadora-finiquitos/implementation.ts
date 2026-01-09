import { BorderZone } from '@workspace/database';
import { InfonavitCalculatorImp } from "../calculadora-infonavit/calculadora-infonavit";
import { InfonavitDailyCalculationValues } from "../calculadora-infonavit/models";
import { MINIMUM_SALARIES } from '../constants';
import { BigCalculatorImpl } from "./calculadora";
import { sortDescendingByEffectiveDate } from "./generics";
import { CalculadoraFiniquitoLiquidacion, ICalculator, ISRCalculator } from "./interface";
import { AffiliateMovement, AffiliateMovementAction, ConceptosFiniquito, ConceptosLiquidacion, ConfiguracionCalculoFiniquitoLiquidacion, ISRRates, PercepcionesFiniquito, PercepcionesLiquidacion, Perception, PerceptionsResult, ResultadoCalculoFiniquitoLiquidacion, ResultadoISRFiniquitoLiquidacion } from './models';

export const runtime = 'nodejs';

export class ImplementationV1 implements CalculadoraFiniquitoLiquidacion {
  private _isrCalculator: ISRCalculator;

  constructor(isrCalculator: ISRCalculator) {
    this._isrCalculator = isrCalculator;
  }

  // calcularFactores(
  //   input: InputCalculoFactores
  // ): FactoresCalculoFiniquitoLiquidacion {

  //   return result;
  // }

  calcular(
    input: ConfiguracionCalculoFiniquitoLiquidacion
  ): ResultadoCalculoFiniquitoLiquidacion | void {
    let tablaISR: ISRRates;
    const percepcionesFiniquito = this.calcularPercepcionesFiniquito(
      input.factoresCalculo.salarioDiario,
      input.factoresCalculo.conceptosFiniquito,
      input.acumuladoPercepciones,
      input.benefitByLawConfiguration
    );
    const percepcionesLiquidacion = this.calcularPercepcionesLiquidacion(
      input.factoresCalculo.salarioDiario,
      input.factoresCalculo.conceptosLiquidacion,
      input.factoresCalculo.antiguedad.factor
    );

    if (input.payrollConstants.isrRates.length == 0) {
      return undefined;
    }

    tablaISR = input.payrollConstants.isrRates[0];
    const calculoISR: ResultadoISRFiniquitoLiquidacion = {
      isrFiniquito: this._isrCalculator.calcularISRFiniquito({
        diasTrabajados: percepcionesFiniquito.diasTrabajados,
        septimoDia: percepcionesFiniquito.septimoDia,
        vacaciones: percepcionesFiniquito.vacaciones,
        vacacionesPendientes: percepcionesFiniquito.vacacionesPendientes,
        sueldoDiario: input.factoresCalculo.salarioDiario,
        otrasPercepciones: input.factoresCalculo.otrasPercepciones,
        tablaISR: tablaISR,
      }),
      isrArt174: this._isrCalculator.calcularISRArt174({
        primaVacacional: percepcionesFiniquito.primaVacacional,
        primaVacacionalPendiente:
          percepcionesFiniquito.primaVacacionalPendiente,
        aguinaldo: percepcionesFiniquito.aguinaldo,
        sueldoDiario: input.factoresCalculo.salarioDiario,
        tablaISR: tablaISR,
      }),
      isrIndemnizacion: this._isrCalculator.calcularISRArt93({
        indemnizacionVeinteDias:
          percepcionesLiquidacion.indemnizacionVeinteDias,
        indemnizacionNoventaDias:
          percepcionesLiquidacion.indemnizacionNoventaDias,
        primaAntiguedad: percepcionesLiquidacion.primaAntiguedad,
        sueldoDiario: input.factoresCalculo.salarioDiario,
        tablaISR: tablaISR,
      }),
    };

    // Finiquito
    // Fiscal
    const totalPercepcionesFiscalFiniquito: ICalculator = new BigCalculatorImpl(
      0
    );
    const totalDeduccionesFiscalFiniquito: ICalculator = new BigCalculatorImpl(
      0
    );
    // Fiscal + Complemento
    const totalPercepcionesFiniquito: ICalculator = new BigCalculatorImpl(0);
    const totalDeduccionesFiniquito: ICalculator = new BigCalculatorImpl(0);
    // Neto
    const netoFiniquito: ICalculator = new BigCalculatorImpl(0);

    // Liquidación
    // Fiscal
    const totalPercepcionesFiscalLiquidacion: ICalculator =
      new BigCalculatorImpl(0);
    const totalDeduccionesFiscalLiquidacion: ICalculator =
      new BigCalculatorImpl(0);
    // Fiscal + Complemento
    const totalPercepcionesLiquidacion: ICalculator = new BigCalculatorImpl(0);
    const totalDeduccionesLiquidacion: ICalculator = new BigCalculatorImpl(0);
    // Neto
    const netoLiquidacion: ICalculator = new BigCalculatorImpl(0);

    // Calcular percepciones totales y fiscales del finiquito
    for (const perception in percepcionesFiniquito) {
      const percepcion =
        percepcionesFiniquito[perception as keyof PercepcionesFiniquito];
      totalPercepcionesFiscalFiniquito.add(percepcion.totalAmount);
    }

    // Agregar otras percepciones (son totalmente gravables)
    input.factoresCalculo.otrasPercepciones.forEach((otraPercepcion) => {
      totalPercepcionesFiscalFiniquito.add(otraPercepcion.monto);
    });

    // Calcular percepciones totales y fiscales de liquidación
    for (const perception in percepcionesLiquidacion) {
      const percepcion =
        percepcionesLiquidacion[perception as keyof PercepcionesLiquidacion];
      totalPercepcionesFiscalLiquidacion.add(percepcion.totalAmount);
    }

    // Calcular deducciones fiscales y totales
    const isrFiniquito = calculoISR.isrFiniquito?.totalImpuesto || 0;
    const isrArt174 = calculoISR.isrArt174?.totalImpuesto || 0;
    const isrLiquidacion = calculoISR.isrIndemnizacion?.totalImpuesto || 0;

    totalDeduccionesFiscalFiniquito.add(isrArt174).add(isrFiniquito);
    totalDeduccionesFiscalLiquidacion.add(isrLiquidacion);

    const calculosInfonavit: ResultadoCalculoFiniquitoLiquidacion["infonavit"] =
      [];
    const infonavitCalculator = new InfonavitCalculatorImp();
    input.infonavit?.forEach((infonavit) => {
      const values: InfonavitDailyCalculationValues[] = [];
      for (let day = 1; day <= infonavit.diasPendientes; day++) {
        values.push({
          date: new Date(),
          affiliateMovementAction: AffiliateMovementAction.Alta,
          umiValue: 100.81,
          minimumSalary: MINIMUM_SALARIES[BorderZone.NO_FRONTERIZA], // Salario mínimo general 2025
          variableSalary: 0,
          dailySalary: input.factoresCalculo.salarioDiario,
          integratedDailySalary: input.factoresCalculo.salarioDiarioIntegrado,
          type: "DiaLaborado",
          discountType: infonavit.credit.discountType,
          actionType: "15",
          discountValue: infonavit.credit.value || 0,
        });
      }

      const calculoInfonavit = infonavitCalculator.calculateInfonavitPayment(
        values,
        input.payrollSettings.calculationSettings.isInfonavitLimitDisabled,
        input.payrollSettings.calculationSettings.infonavit
          .cuotaFijaCalculationMethod || "default"
      );

      totalDeduccionesFiscalFiniquito.add(calculoInfonavit);
      totalDeduccionesFiscalFiniquito.add(infonavit.montoAjuste);
      totalDeduccionesFiscalFiniquito.add(infonavit.seguroVivienda);
      calculosInfonavit.push({
        credit: infonavit.credit,
        diasPendientes: infonavit.diasPendientes,
        montoCalculadoDiasPendientes: calculoInfonavit,
        montoAjuste: infonavit.montoAjuste,
        seguroVivienda: infonavit.seguroVivienda,
      });
    });

    // Agregar otras deducciones (solo al total, no son fiscales)
    input.factoresCalculo.otrasDeducciones.forEach((otraDeduccion) =>
      totalDeduccionesFiscalFiniquito.add(otraDeduccion.monto)
    );

    // Calcular netos fiscales
    const netoFiscalFiniquito: ICalculator = new BigCalculatorImpl(
      totalPercepcionesFiscalFiniquito.result
    ).subtract(totalDeduccionesFiscalFiniquito.result);
    const netoFiscalLiquidacion: ICalculator = new BigCalculatorImpl(
      totalPercepcionesFiscalLiquidacion.result
    ).subtract(totalDeduccionesFiscalLiquidacion.result);

    const result: ResultadoCalculoFiniquitoLiquidacion = {
      percepcionesFiniquito,
      percepcionesLiquidacion,
      calculoISR,
      infonavit: calculosInfonavit,
      otrasDeducciones: input.factoresCalculo.otrasDeducciones,
      otrasPercepciones: input.factoresCalculo.otrasPercepciones,
      finiquito: {
        // Fiscal
        totalPercepcionesFiscal: totalPercepcionesFiscalFiniquito.result,
        totalDeduccionesFiscal: totalDeduccionesFiscalFiniquito.result,
        netoFiscal: netoFiscalFiniquito.result,
        // Complemento
        totalPercepciones: 0,
        totalDeducciones: 0,
        netoComplemento: 0,
        // Neto
        neto: netoFiscalFiniquito.result,
      },
      liquidacion: {
        // Fiscal
        totalPercepcionesFiscal: totalPercepcionesFiscalLiquidacion.result,
        totalDeduccionesFiscal: totalDeduccionesFiscalLiquidacion.result,
        netoFiscal: netoFiscalLiquidacion.result,
        // Complemento
        totalPercepciones: 0,
        totalDeducciones: 0,
        netoComplemento: 0, // Se calculará después si hay complemento
        // Neto
        neto: netoFiscalLiquidacion.result,
      },
    };

    if (input.factoresComplemento) {
      const totalPercepcionesComplemento: ICalculator = new BigCalculatorImpl(
        0
      );
      const totalDeduccionesComplemento: ICalculator = new BigCalculatorImpl(0);
      const percepcionesFiniquitoComplemento =
        this.calcularPercepcionesFiniquito(
          input.factoresComplemento.salarioDiario,
          input.factoresComplemento.conceptosFiniquito,
          input.acumuladoPercepciones,
          input.benefitByLawConfiguration
        );

      for (const perception in percepcionesFiniquitoComplemento) {
        const percepcion =
          percepcionesFiniquitoComplemento[
          perception as keyof PercepcionesFiniquito
          ];
        totalPercepcionesFiniquito.add(percepcion.totalAmount);
      }

      if (input.factoresComplemento.conceptosLiquidacion) {
        const percepcionesLiquidacionComplemento =
          this.calcularPercepcionesLiquidacion(
            input.factoresComplemento.salarioDiario,
            input.factoresComplemento.conceptosLiquidacion,
            input.factoresComplemento.antiguedad.factor
          );

        result.percepcionesLiquidacionComplemento =
          percepcionesLiquidacionComplemento;

        // Calculate net liquidación complemento by subtracting fiscal amounts from complemento amounts
        const netLiquidacionComplemento =
          (percepcionesLiquidacionComplemento.indemnizacionNoventaDias.totalAmount - percepcionesLiquidacion.indemnizacionNoventaDias.totalAmount) +
          (percepcionesLiquidacionComplemento.indemnizacionVeinteDias.totalAmount - percepcionesLiquidacion.indemnizacionVeinteDias.totalAmount) +
          (percepcionesLiquidacionComplemento.primaAntiguedad.totalAmount - percepcionesLiquidacion.primaAntiguedad.totalAmount);

        totalPercepcionesLiquidacion.add(netLiquidacionComplemento);

        result.liquidacion.totalPercepciones =
          totalPercepcionesLiquidacion.result;
      }

      result.percepcionesFiniquitoComplemento =
        percepcionesFiniquitoComplemento;

      result.otrasPercepcionesComplemento =
        input.factoresComplemento.otrasPercepciones;
      result.otrasDeduccionesComplemento =
        input.factoresComplemento.otrasDeducciones;

      // Calculate net complemento by subtracting fiscal amounts from complemento amounts
      totalPercepcionesComplemento
        .add(percepcionesFiniquitoComplemento.aguinaldo.totalAmount - percepcionesFiniquito.aguinaldo.totalAmount)
        .add(percepcionesFiniquitoComplemento.primaVacacional.totalAmount - percepcionesFiniquito.primaVacacional.totalAmount)
        .add(
          percepcionesFiniquitoComplemento.primaVacacionalPendiente.totalAmount - percepcionesFiniquito.primaVacacionalPendiente.totalAmount
        )
        .add(percepcionesFiniquitoComplemento.vacaciones.totalAmount - percepcionesFiniquito.vacaciones.totalAmount)
        .add(percepcionesFiniquitoComplemento.vacacionesPendientes.totalAmount - percepcionesFiniquito.vacacionesPendientes.totalAmount)
        .add(percepcionesFiniquitoComplemento.diasTrabajados.totalAmount - percepcionesFiniquito.diasTrabajados.totalAmount)
        .add(percepcionesFiniquitoComplemento.septimoDia.totalAmount - percepcionesFiniquito.septimoDia.totalAmount)
        .add(
          percepcionesFiniquitoComplemento.diasRetroactivosSueldo.totalAmount - percepcionesFiniquito.diasRetroactivosSueldo.totalAmount
        );

      input.factoresComplemento.otrasPercepciones.forEach((otraPercepcion) => {
        totalPercepcionesComplemento.add(otraPercepcion.monto);
        totalPercepcionesFiniquito.add(otraPercepcion.monto);
      });

      result.finiquito.totalPercepciones = totalPercepcionesFiniquito.result;

      input.factoresComplemento.otrasDeducciones.forEach((otraDeduccion) =>
        totalDeduccionesComplemento.add(otraDeduccion.monto)
      );

      result.totalPercepcionesComplemento = totalPercepcionesComplemento.result;

      if (totalDeduccionesComplemento.result > 0) {
        if (
          totalDeduccionesComplemento.result < totalPercepcionesFiniquito.result
        ) {
          result.finiquito.totalDeducciones =
            totalDeduccionesComplemento.result;
        } else {
          const totalDeduccionesLiquidacion =
            totalDeduccionesComplemento.subtract(
              totalPercepcionesFiniquito.result
            );
          result.finiquito.totalDeducciones = totalPercepcionesFiniquito.result;
          result.liquidacion.totalDeducciones =
            totalDeduccionesLiquidacion.result;
        }
      }

      // Calcular el neto del complemento correctamente
      const netoComplementoCalculator: ICalculator = new BigCalculatorImpl(
        totalPercepcionesComplemento.result
      ).subtract(totalDeduccionesComplemento.result);

      result.totalDeduccionesComplemento = totalDeduccionesComplemento.result;
      result.complementoNeto = netoComplementoCalculator.result;

      // Actualizar netoComplemento en finiquito y liquidación
      if (result.finiquito.totalPercepciones > 0) {
        result.finiquito.netoComplemento =
          result.finiquito.totalPercepciones -
          (result.finiquito.totalDeducciones +
            result.finiquito.totalDeduccionesFiscal +
            result.finiquito.netoFiscal);
        result.finiquito.neto =
          result.finiquito.netoComplemento + result.finiquito.netoFiscal;
      }

      if (result.liquidacion.totalPercepciones > 0) {
        // totalPercepciones and totalDeducciones are already NET complemento values (complemento - fiscal)
        // No need to subtract fiscal amounts again
        result.liquidacion.netoComplemento =
          result.liquidacion.totalPercepciones - result.liquidacion.totalDeducciones;
        result.liquidacion.neto =
          result.liquidacion.netoComplemento + result.liquidacion.netoFiscal;
      }
    }

    return result;
  }

  private calcularConcepto(salarioDiario: number, factor: number): Perception {
    const amount: ICalculator = new BigCalculatorImpl(
      salarioDiario,
      12
    ).multiply(factor);
    const result: Perception = {
      totalQuantity: factor,
      totalAmount: amount.result,
      totalTaxBase: amount.result,
      totalExemptBase: 0,
      detail: [],
    };

    return result;
  }

  private calcularAguinaldo(
    salarioDiario: number,
    factor: number,
    umaValue: number
  ): Perception {
    const aginaldo: Perception = this.calcularConcepto(salarioDiario, factor);
    let exento: ICalculator = new BigCalculatorImpl(umaValue).multiply(30);
    if (exento.result > aginaldo.totalAmount) {
      exento = new BigCalculatorImpl(aginaldo.totalAmount);
    }
    const gravado: ICalculator = new BigCalculatorImpl(
      aginaldo.totalAmount
    ).subtract(exento.result);
    aginaldo.totalExemptBase = exento.result;
    aginaldo.totalTaxBase = gravado.result;

    return aginaldo;
  }

  private calcularPrimaVacacional(
    salarioDiario: number,
    vacationDays: number,
    acumuladoPercepciones: Array<PerceptionsResult>,
    umaValue: number,
    primaVacacionalPercent?: number
  ): Perception {
    const factor: ICalculator = new BigCalculatorImpl(vacationDays).percentage(
      primaVacacionalPercent ?? 25
    );
    const primaVacacional: Perception = this.calcularConcepto(
      salarioDiario,
      factor.result
    );
    const totalExemptBase = acumuladoPercepciones.reduce(
      (acc: ICalculator, current) => {
        acc.add(current.primaVacacional?.totalExemptBase || 0);
        return acc;
      },
      new BigCalculatorImpl(0)
    );
    let exento: ICalculator = new BigCalculatorImpl(umaValue)
      .multiply(15)
      .subtract(totalExemptBase.result);
    if (exento.result < 0) {
      exento = new BigCalculatorImpl(0);
    }

    if (exento.result > primaVacacional.totalAmount) {
      exento = new BigCalculatorImpl(primaVacacional.totalAmount);
    }

    const gravado: ICalculator = new BigCalculatorImpl(
      primaVacacional.totalAmount
    ).subtract(exento.result);
    if (factor.result > 0) {
      primaVacacional.totalExemptBase = exento.result;
      primaVacacional.totalTaxBase = gravado.result;
    }

    return primaVacacional;
  }

  private calcularPercepcionesFiniquito(
    salarioDiario: number,
    conceptosFiniquito: ConceptosFiniquito,
    acumuladoPercepciones: Array<PerceptionsResult>,
    benefitConfig?: { primaVacacional?: number; aguinaldo?: number }
  ): PercepcionesFiniquito {
    const result: PercepcionesFiniquito = {
      diasTrabajados: this.calcularConcepto(
        salarioDiario,
        conceptosFiniquito.diasTrabajados
      ),
      septimoDia: this.calcularConcepto(
        salarioDiario,
        conceptosFiniquito.septimoDia
      ),
      vacaciones: this.calcularConcepto(
        salarioDiario,
        conceptosFiniquito.vacaciones
      ),
      vacacionesPendientes: this.calcularConcepto(
        salarioDiario,
        conceptosFiniquito.vacacionesPendientes
      ),
      primaVacacional: this.calcularPrimaVacacional(
        salarioDiario,
        conceptosFiniquito.primaVacacional,
        acumuladoPercepciones,
        113.14,
        benefitConfig?.primaVacacional
      ),
      primaVacacionalPendiente: this.calcularPrimaVacacional(
        salarioDiario,
        conceptosFiniquito.primaVacacionalPendiente,
        acumuladoPercepciones,
        113.14,
        benefitConfig?.primaVacacional
      ),
      aguinaldo: this.calcularAguinaldo(
        salarioDiario,
        conceptosFiniquito.aguinaldo,
        113.14
      ),
      diasRetroactivosSueldo: this.calcularConcepto(
        salarioDiario,
        conceptosFiniquito.diasRetroactivosSueldo
      ),
    };

    return result;
  }

  private calcularPercepcionesLiquidacion(
    salarioDiario: number,
    conceptosLiquidacion: ConceptosLiquidacion,
    factorAntiguedad: number
  ): PercepcionesLiquidacion {
    const aniosExentos = this.customRound(factorAntiguedad);
    const umaValue = 113.14;
    let montoExento: ICalculator = new BigCalculatorImpl(aniosExentos)
      .multiply(90)
      .multiply(umaValue);
    const result: PercepcionesLiquidacion = {
      indemnizacionVeinteDias: this.calcularConcepto(
        salarioDiario,
        conceptosLiquidacion.indemnizacionVeinteDias
      ),
      indemnizacionNoventaDias: this.calcularConcepto(
        salarioDiario,
        conceptosLiquidacion.indemnizacionNoventaDias
      ),
      primaAntiguedad: this.calcularPrimaAntiguedad(
        salarioDiario,
        conceptosLiquidacion.primaAntiguedad
      ),
    };

    let resultExentoLiquidacion = this.calcularExentoLiquidacion(
      montoExento,
      result.indemnizacionNoventaDias
    );
    result.indemnizacionNoventaDias = resultExentoLiquidacion.percepcionResult;
    montoExento = resultExentoLiquidacion.exentoResult;

    resultExentoLiquidacion = this.calcularExentoLiquidacion(
      montoExento,
      result.indemnizacionVeinteDias
    );
    result.indemnizacionVeinteDias = resultExentoLiquidacion.percepcionResult;
    montoExento = resultExentoLiquidacion.exentoResult;

    resultExentoLiquidacion = this.calcularExentoLiquidacion(
      montoExento,
      result.primaAntiguedad
    );
    result.primaAntiguedad = resultExentoLiquidacion.percepcionResult;
    montoExento = resultExentoLiquidacion.exentoResult;

    return result;
  }

  private calcularPrimaAntiguedad(
    salarioDiario: number,
    factor: number
  ): Perception {
    const salarioMinimo = 248.93;
    const topeSalario: ICalculator = new BigCalculatorImpl(
      salarioMinimo
    ).multiply(2);
    const amount: ICalculator = new BigCalculatorImpl(factor, 12);
    if (salarioDiario <= topeSalario.result) {
      amount.multiply(salarioDiario);
    } else {
      amount.multiply(topeSalario.result);
    }

    const result: Perception = {
      totalQuantity: factor,
      totalAmount: amount.result,
      totalTaxBase: amount.result,
      totalExemptBase: 0,
      detail: [],
    };

    return result;
  }

  private calcularExentoLiquidacion(
    exento: ICalculator,
    percepcion: Perception
  ): { exentoResult: ICalculator; percepcionResult: Perception } {
    if (percepcion.totalAmount > 0 && exento.result > 0) {
      let montoExento = exento.result;
      const gravado: ICalculator = new BigCalculatorImpl(
        percepcion.totalAmount
      );
      if (montoExento > percepcion.totalAmount) {
        montoExento = percepcion.totalAmount;
      }

      gravado.subtract(montoExento);
      percepcion.totalExemptBase = montoExento;
      percepcion.totalTaxBase = gravado.result;
      exento.subtract(montoExento);
    }

    return { exentoResult: exento, percepcionResult: percepcion };
  }

  private customRound(value: number): number {
    const decimal = value - Math.floor(value);
    if (decimal >= 0.5) {
      return Math.ceil(value);
    }

    return Math.floor(value);
  }

  private obtenerMovimientoAlta(
    movimientosAfiliatorios: AffiliateMovement[]
  ): AffiliateMovement | void {
    const movimientosAfiliatoriosOrdenados = sortDescendingByEffectiveDate(
      movimientosAfiliatorios
    );
    if (movimientosAfiliatoriosOrdenados.length === 0) {
      return;
    }

    return;
  }
}

import { ICalculator } from "../calculadora-finiquitos/interface";
import { BigCalculatorImpl } from "../calculadora-finiquitos/calculadora";
import { InfonavitDailyCalculationValues } from "./models";
import { InfonavitCalculator } from "./interface";


class InfonavitCalculatorImp implements InfonavitCalculator {
  constructor() { }

  public calculateInfonavitPayment(
    values: InfonavitDailyCalculationValues[],
    isInfonavitLimitDisabled: boolean,
    calculationMethod: 'default' | 'simplificado' = 'default'
  ): number {
    const result: ICalculator = new BigCalculatorImpl(0);
    values.forEach((value) => {
      const diasBimestre = this.calcularDiasBimestre(value.date);
      let valorDescuento: ICalculator = new BigCalculatorImpl(0);
      const limiteDescuento: ICalculator = new BigCalculatorImpl(
        value.integratedDailySalary
      ).percentage(20);
      if (value.affiliateMovementAction === "baja") {
        return;
      }

      switch (String(value.discountType)) {
        case "1":
          valorDescuento
            .add(value.integratedDailySalary)
            .percentage(value.discountValue);
          break;
        case "2":
          if (calculationMethod === 'simplificado') {
            // Implementación simplificada: dividir el monto del crédito entre 2
            valorDescuento
              .add(value.discountValue)
              .divide(2)
              .divide(values.length);
          } else {
            // Implementación default
            valorDescuento
              .add(value.discountValue)
              .multiply(2)
              .divide(diasBimestre);
          }
          break;
        case "3":
          valorDescuento
            .add(value.discountValue)
            .multiply(2)
            .multiply(value.umiValue);
          valorDescuento.divide(diasBimestre);
          break;
      }

      if (
        !isInfonavitLimitDisabled &&
        valorDescuento.value > limiteDescuento.value &&
        value.dailySalary == value.minimumSalary &&
        value.variableSalary == 0
      ) {
        valorDescuento = limiteDescuento;
      }

      result.add(valorDescuento.value);
    });

    return result.result;
  }

  private calcularDiasBimestre(fecha: Date): number {
    let result = 0;
    switch (fecha.getMonth()) {
      case 0:
      case 1:
        result = 59;
        break;
      case 2:
      case 3:
      case 4:
      case 5:
      case 8:
      case 9:
      case 10:
      case 11:
        result = 61;

        break;
      case 6:
      case 7:
        result = 62;
    }

    return result;
  }
}

export { InfonavitCalculatorImp };

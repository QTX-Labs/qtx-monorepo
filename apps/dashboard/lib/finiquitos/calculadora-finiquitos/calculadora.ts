import { Big } from "big.js";
import { ICalculator } from "./interface";


class BigCalculatorImpl implements ICalculator {
  private _value: Big;
  private _operationDecimals: number;
  private _resultDecimals: number;

  constructor();
  constructor(value?: number, operationDecimals?: number);

  constructor(value?: number, operationDecimals?: number) {
    this._operationDecimals =
      operationDecimals !== undefined ? operationDecimals : 5;
    this._resultDecimals = 2;
    Big.DP = this._operationDecimals;
    Big.RM = Big.roundHalfEven;
    this._value = value ? Big(value) : Big(0);
  }

  get value(): number {
    return this._value.round(this._operationDecimals).toNumber();
  }

  get result(): number {
    return this._value.round(this._resultDecimals).toNumber();
  }

  add = (n: number): BigCalculatorImpl => {
    this._value = this._value.plus(n);
    return this;
  };

  subtract = (n: number): BigCalculatorImpl => {
    this._value = this._value.minus(n);
    return this;
  };

  multiply = (n: number): BigCalculatorImpl => {
    this._value = this._value.times(n);
    return this;
  };

  divide = (n: number): BigCalculatorImpl => {
    if (this._value.toNumber() == 0) {
      return this;
    }

    this._value = this._value.div(n);
    return this;
  };

  percentage = (n: number): BigCalculatorImpl => {
    this._value = this._value.times(n ?? 0).div(100);
    return this;
  };
}

export { BigCalculatorImpl };

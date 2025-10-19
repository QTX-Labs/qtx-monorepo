import moment from "moment-timezone";
import { DateComparer, IDateOperations } from "./interface";


export class MomentImplementation implements IDateOperations {
  private _timezone: string;

  constructor();
  constructor(timezone: string);

  constructor(timezone?: string) {
    this._timezone = timezone ?? "Etc/GMT+6";
  }

  fullYearsDifference(start: Date | string, end: Date | string): number {
    const startMoment = moment(start).tz(this._timezone).startOf("day");
    const endMoment = moment(end).tz(this._timezone).endOf("day");

    return endMoment.diff(startMoment, "years");
  }

  getDaysExcludingFullYears(start: Date | string, end: Date | string): number {
    const startMoment = moment(start).tz(this._timezone).startOf("day");
    const endMoment = moment(end).tz(this._timezone).endOf("day");
    const fullYearsDifference = this.fullYearsDifference(start, end);
    const adjustedStartDate = startMoment.add(fullYearsDifference, "years");
    let diff = endMoment.diff(adjustedStartDate, "days");
    diff++;
    return diff;
  }

  getTotalDaysOfYear(date: string | Date): number {
    const momentDate = moment(date).tz(this._timezone).startOf("day");
    return momentDate.isLeapYear() ? 366 : 365;
  }

  getFirstDayOfYear(date: string | Date): Date {
    const momentDate = moment(date).tz(this._timezone).startOf("year");
    return momentDate.toDate();
  }
}


export class MomentDateComparer implements DateComparer {
  private _defaultTimeZone: string = "Etc/GMT+6";
  private _timeZone: string;

  constructor();
  constructor(timeZone: string);
  constructor(timeZone?: string) {
    if (timeZone !== undefined) {
      this._timeZone = timeZone;
    } else {
      this._timeZone = this._defaultTimeZone;
    }
  }

  isSameYearDay(date1: Date, date2: Date): boolean {
    const d1 = moment(date1).tz(this._timeZone).startOf("day");
    const d2 = moment(date2).tz(this._timeZone).startOf("day");
    return d1.isSame(d2, "day");
  }

  isSameYearMonth(date1: Date, date2: Date): boolean {
    const d1 = moment(date1).tz(this._timeZone).startOf("day");
    const d2 = moment(date2).tz(this._timeZone).startOf("day");
    return d1.isSame(d2, "year") && d1.isSame(d2, "month");
  }

  isSameOrAfterYearDay(date1: Date, date2: Date): boolean {
    const d1 = moment(date1).tz(this._timeZone).startOf("day");
    const d2 = moment(date2).tz(this._timeZone).startOf("day");
    return d1.isSame(d2, "day") || d1.diff(d2, "days") > 0;
  }

  isSameOrAfterDate(date1: Date | string, date2: Date | string): boolean {
    const d1 = moment(date1).tz(this._timeZone).startOf("day");
    const d2 = moment(date2).tz(this._timeZone).startOf("day");
    return d1.isSameOrAfter(d2, "day");
  }
}

import moment from "moment-timezone";

interface ICalendarPeriod {
  get start(): Date;
  get end(): Date;
  get dateRange(): Date[];
  isBetween(date: Date): boolean;
}

export type { ICalendarPeriod };

const DEFAULT_TIMEZONE = "Etc/GMT+6";

interface hasEffectiveDate {
  effectiveDate: Date;
}

interface hasRangeValues {
  lowerLimit: number;
  upperLimit: number;
}

export function setLocalTimeZoneInElements<T extends hasEffectiveDate>(
  items: T[]
): T[] {
  items.map((item) => {
    item.effectiveDate = moment(item.effectiveDate)
      .tz(DEFAULT_TIMEZONE)
      .startOf("day")
      .toDate();
  });

  return items;
}

export function sortAscendingByEffectiveDate<T extends hasEffectiveDate>(
  items: T[]
): T[] {
  return items.sort(
    (current, next) =>
      current.effectiveDate.getTime() - next.effectiveDate.getTime()
  );
}

export function sortDescendingByEffectiveDate<T extends hasEffectiveDate>(
  items: T[]
): T[] {
  return items.sort(
    (current, next) =>
      next.effectiveDate.getTime() - current.effectiveDate.getTime()
  );
}

function FilterByEffectiveDate<T extends hasEffectiveDate>(
  items: T[],
  period: ICalendarPeriod
): T[] {
  items = setLocalTimeZoneInElements(items);
  items = sortAscendingByEffectiveDate(items);

  return items.filter((item, index, array) => {
    const lastIndex = array.length - 1;
    if (array.length === 1 && item.effectiveDate < period.end) {
      return true;
    }

    if (
      item.effectiveDate.getTime() >= period.start.getTime() &&
      item.effectiveDate.getTime() <= period.end.getTime()
    ) {
      return true;
    }

    if (index != lastIndex) {
      if (
        item.effectiveDate.getTime() <= period.start.getTime() &&
        array[index + 1].effectiveDate.getTime() > period.start.getTime()
      ) {
        return true;
      }
    }

    if (index == lastIndex) {
      item.effectiveDate.getTime() < period.end.getTime();
      return true;
    }
  });
}

function FilterItemByEffectiveDate<T extends hasEffectiveDate>(
  items: T[],
  date: Date
): T | void {
  const dateInTimeZone = moment(date)
    .tz(DEFAULT_TIMEZONE)
    .endOf("day")
    .toDate();
  const lastIndex = items.length - 1;
  items = setLocalTimeZoneInElements(items);
  items = sortAscendingByEffectiveDate(items);

  return items.find((item, index, array) => {
    if (item.effectiveDate <= dateInTimeZone) {
      if (array.length === 1 || index === lastIndex) {
        return item;
      }
    }

    if (index != lastIndex) {
      if (
        item.effectiveDate <= dateInTimeZone &&
        array[index + 1].effectiveDate > dateInTimeZone
      ) {
        return item;
      }
    }
  });
}

function FilterByRangeValues<T extends hasRangeValues>(
  items: T[],
  value: number
): T | void {
  if (items.length === 0) {
    return;
  }

  const result = items.find((item) => {
    if (
      value >= item.lowerLimit &&
      (value <= item.upperLimit || item.upperLimit === 0)
    ) {
      return item;
    }
  });

  return result;
}

export function GetRangeValuesIndex<T extends hasRangeValues>(
  items: T[],
  value: number
): number | void {
  let result = undefined;
  if (items.length === 0) {
    return;
  }

  items.find((item, index) => {
    if (value >= item.lowerLimit && value <= item.upperLimit) {
      result = index;
      return;
    }
  });

  return result;
}

export {
  FilterByEffectiveDate,
  FilterItemByEffectiveDate,
  FilterByRangeValues,
};

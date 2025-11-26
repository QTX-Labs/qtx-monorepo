/**
 * Utility to detect if Step 1 data has changed in critical fields
 * that affect Step 2 factor calculations.
 *
 * This is used to warn users when returning from Step 2 to Step 1
 * and making changes that would invalidate their manual edits in Step 2.
 */

import type { Step1BaseConfig } from '../schemas/step1-base-config-schema';

/**
 * Critical fields that affect factor calculations in Step 2.
 * Changes to these fields require recalculating Step 2 factors.
 */
const CRITICAL_FIELDS: (keyof Step1BaseConfig)[] = [
  // Date fields
  'hireDate',
  'terminationDate',
  'realHireDate',

  // Salary fields
  'fiscalDailySalary',
  'integratedDailySalary',
  'realDailySalary',
  'complementIntegratedDailySalary',

  // Factor configuration fields
  'aguinaldoDays',
  'vacationDays',
  'vacationPremiumPercentage',
  'integrationFactor',
  'complementIntegrationFactor',

  // Toggle fields
  'liquidacionActivada',
  'complementoActivado',
];

/**
 * Compares two Step1BaseConfig objects to detect changes in critical fields.
 *
 * @param current - Current Step 1 form data
 * @param previous - Previously saved Step 1 data from wizard context
 * @returns true if any critical field has changed, false otherwise
 */
export function hasStep1DataChanged(
  current: Step1BaseConfig,
  previous: Step1BaseConfig | null
): boolean {
  // If no previous data exists, consider it as "not changed"
  // (this is the initial flow, not a "back to Step 1" scenario)
  if (!previous) {
    return false;
  }

  // Check each critical field for changes
  return CRITICAL_FIELDS.some((field) => {
    const currValue = current[field];
    const prevValue = previous[field];

    // Special handling for Date objects
    if (currValue instanceof Date && prevValue instanceof Date) {
      return currValue.getTime() !== prevValue.getTime();
    }

    // Handle null/undefined cases
    if (currValue === null || currValue === undefined) {
      return prevValue !== null && prevValue !== undefined;
    }

    if (prevValue === null || prevValue === undefined) {
      return currValue !== null && currValue !== undefined;
    }

    // Standard comparison for primitives
    return currValue !== prevValue;
  });
}

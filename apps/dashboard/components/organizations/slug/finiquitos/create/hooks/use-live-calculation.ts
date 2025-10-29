/**
 * Live Calculation Hook for Finiquito Wizard
 *
 * This hook provides real-time finiquito calculation updates as the user
 * edits form data across wizard steps. It implements several optimizations
 * to prevent infinite loops and excessive recalculation.
 *
 * ARCHITECTURE:
 * - Watches form data from Steps 1, 2, and 3 via wizard context
 * - Debounces Step 2 (factors) and Step 3 (deductions) changes (300ms)
 * - Uses stable dependency keys (JSON.stringify) to prevent infinite loops
 * - Recalculates entire finiquito on each dependency change
 * - Updates wizard context with new calculation result
 *
 * INFINITE LOOP PREVENTION:
 * The hook uses useMemo with JSON.stringify to create stable keys from data.
 * This prevents re-renders caused by object reference changes from form.watch().
 * Without this, the useEffect would trigger infinitely because form.watch()
 * returns new object references on every render.
 *
 * DEBOUNCING:
 * Step 2 and Step 3 data are debounced (300ms) to prevent excessive
 * recalculation while user is typing. Step 1 is not debounced because
 * it only changes on form submit (navigation to Step 2).
 *
 * USAGE:
 * Used in Step 2 (factors) and Step 3 (deductions) to show live calculation
 * panel alongside form. Step 1 calls calculateFiniquitoComplete directly
 * on submit to populate initial factors.
 *
 * RELATED:
 * - See /apps/dashboard/lib/finiquitos/calculate-finiquito-complete.ts for calculation logic
 * - See /apps/dashboard/components/organizations/slug/finiquitos/create/wizard-context.tsx for state management
 * - See /apps/dashboard/components/organizations/slug/finiquitos/shared/live-calculation-panel.tsx for UI
 */

import { useEffect, useState, useMemo } from 'react';

import { SalaryFrequency } from '@workspace/database';

import { calculateFiniquitoComplete } from '~/lib/finiquitos/calculate-finiquito-complete';
import type { CalculateFiniquitoOutput } from '~/lib/finiquitos/types/calculate-finiquito-types';
import type { Step1BaseConfig } from '~/lib/finiquitos/schemas/step1-base-config-schema';
import type { Step2Factors } from '~/lib/finiquitos/schemas/step2-factors-schema';
import type { Step3Deductions } from '~/lib/finiquitos/schemas/step3-deductions-schema';
import { useDebounce } from '~/hooks/use-debounce';

type UseLiveCalculationParams = {
  step1Data: Step1BaseConfig | null;
  step2Data?: Step2Factors | null;
  step3Data?: Step3Deductions | null;
};

/**
 * Hook para cálculo en vivo de finiquito
 *
 * Recalcula automáticamente cuando cambian los datos de entrada,
 * con debouncing de 300ms para evitar cálculos excesivos.
 *
 * @param params - Datos de los pasos 1, 2 y 3
 * @returns El resultado del cálculo actualizado
 */
export function useLiveCalculation({
  step1Data,
  step2Data,
  step3Data,
}: UseLiveCalculationParams): CalculateFiniquitoOutput | null {
  const [calculation, setCalculation] = useState<CalculateFiniquitoOutput | null>(null);

  // Debounce de factores y deducciones para evitar cálculos excesivos
  const debouncedStep2Data = useDebounce(step2Data, 300);
  const debouncedStep3Data = useDebounce(step3Data, 300);

  // Crear una clave estable basada en los valores, no en las referencias de objeto
  const step1Key = useMemo(() => JSON.stringify(step1Data), [step1Data]);
  const step2Key = useMemo(() => JSON.stringify(debouncedStep2Data), [debouncedStep2Data]);
  const step3Key = useMemo(() => JSON.stringify(debouncedStep3Data), [debouncedStep3Data]);

  useEffect(() => {
    // Solo calcular si tenemos los datos base
    if (!step1Data) {
      setCalculation(null);
      return;
    }

    try {
      const calculationInput = {
        employeeId: step1Data.employeeId,
        hireDate: step1Data.hireDate,
        terminationDate: step1Data.terminationDate,
        fiscalDailySalary: step1Data.fiscalDailySalary,
        integratedDailySalary: step1Data.integratedDailySalary,
        borderZone: step1Data.borderZone,
        salaryFrequency: step1Data.salaryFrequency ?? SalaryFrequency.MONTHLY,
        aguinaldoDays: step1Data.aguinaldoDays,
        vacationDays: step1Data.vacationDays,
        vacationPremiumPercentage: step1Data.vacationPremiumPercentage,
        pendingVacationDays: debouncedStep2Data?.beneficiosFiscalesPendientes?.pendingVacationDays ?? 0,
        pendingVacationPremium: debouncedStep2Data?.beneficiosFiscalesPendientes?.pendingVacationPremium ?? 0,
        complemento: step1Data.complementoActivado && step1Data.realHireDate && step1Data.realDailySalary ? {
          enabled: true,
          realHireDate: step1Data.realHireDate,
          realDailySalary: step1Data.realDailySalary,
          complementIntegratedDailySalary: step1Data.complementIntegratedDailySalary,
          pendingVacationDays: debouncedStep2Data?.beneficiosComplementoPendientes?.complementPendingVacationDays ?? 0,
          pendingVacationPremium: debouncedStep2Data?.beneficiosComplementoPendientes?.complementPendingVacationPremium ?? 0,
        } : undefined,
        liquidacion: step1Data.liquidacionActivada ? { enabled: true } : undefined,
        deduccionesManuales: debouncedStep3Data?.deduccionesManuales || {
          infonavit: 0,
          fonacot: 0,
          otras: 0,
          subsidio: 0,
        },
        // Pasar factores editados del Step 2 para cálculo en vivo
        manualFactors: debouncedStep2Data ? {
          finiquito: debouncedStep2Data.factoresFiniquito,
          liquidacion: debouncedStep2Data.factoresLiquidacion,
          complemento: debouncedStep2Data.factoresComplemento,
          liquidacionComplemento: debouncedStep2Data.factoresLiquidacionComplemento,
          configuracionAdicional: debouncedStep2Data.configuracionAdicional,
        } : undefined,
        // Pasar ISR manual del Step 3 si está activado
        manualISR: debouncedStep3Data?.enableManualISR && debouncedStep3Data?.manualISR
          ? debouncedStep3Data.manualISR
          : undefined,
      };

      const result = calculateFiniquitoComplete(calculationInput);

      setCalculation(result);
    } catch (error) {
      console.error('[useLiveCalculation] Error calculating finiquito:', error);
      setCalculation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step1Key, step2Key, step3Key]);

  return calculation;
}

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    // Solo calcular si tenemos los datos base
    if (!step1Data) {
      setCalculation(null);
      return;
    }

    try {
      const result = calculateFiniquitoComplete({
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
      });

      setCalculation(result);
    } catch (error) {
      console.error('[useLiveCalculation] Error calculating finiquito:', error);
      setCalculation(null);
    }
  }, [step1Data, debouncedStep2Data, debouncedStep3Data]);

  return calculation;
}

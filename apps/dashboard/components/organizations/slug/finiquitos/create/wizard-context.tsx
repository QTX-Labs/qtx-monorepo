/**
 * Finiquito Wizard Context
 *
 * Manages shared state across the 4-step finiquito creation wizard.
 * This context provides centralized state management for form data,
 * wizard navigation, and live calculation results.
 *
 * WIZARD STEPS:
 * 1. Base Config - Employee info, dates, salaries, toggles for liquidación/complemento
 * 2. Factors - Editable calculated factors (days) for finiquito/liquidación/complemento
 * 3. Deductions - Manual deductions (Infonavit, Fonacot, other)
 * 4. Review - Final review and submission
 *
 * STATE MANAGEMENT:
 * - currentStep: tracks active wizard step (1-4)
 * - step1Data, step2Data, step3Data: form data for each step
 * - liveCalculation: current calculation result (updated in real-time)
 *
 * STEP 1 → STEP 2 DATA FLOW:
 * When user completes Step 1 and clicks "Siguiente":
 * 1. Step1BaseConfig.onSubmit() calls calculateFiniquitoComplete()
 * 2. Result is used to populate Step 2 factors via updateStep2()
 * 3. diasTrabajados and septimoDia are set to 0 (user must fill manually)
 * 4. All other factors are pre-populated from calculation
 * 5. liveCalculation is stored via updateLiveCalculation()
 * 6. Navigation advances to Step 2 via goNext()
 *
 * See step1-base-config.tsx lines 143-205 for implementation.
 *
 * LIVE CALCULATION UPDATES:
 * Steps 2 and 3 use useLiveCalculation hook to recalculate in real-time
 * as user edits factors/deductions. Hook updates context via
 * updateLiveCalculation() on each change (debounced 300ms).
 *
 * RELATED:
 * - See /apps/dashboard/components/organizations/slug/finiquitos/create/steps/step1-base-config.tsx for Step 1 → Step 2 flow
 * - See /apps/dashboard/components/organizations/slug/finiquitos/create/hooks/use-live-calculation.ts for live updates
 */

'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Step1BaseConfig } from '~/lib/finiquitos/schemas/step1-base-config-schema';
import type { Step2Factors } from '~/lib/finiquitos/schemas/step2-factors-schema';
import type { Step3Deductions } from '~/lib/finiquitos/schemas/step3-deductions-schema';
import type { CalculateFiniquitoOutput } from '~/lib/finiquitos/types/calculate-finiquito-types';

type WizardStep = 1 | 2 | 3 | 4;

type WizardState = {
  currentStep: WizardStep;

  // Data de cada paso
  step1Data: Step1BaseConfig | null;
  step2Data: Step2Factors | null;
  step3Data: Step3Deductions | null;

  // Resultado del cálculo en vivo
  liveCalculation: CalculateFiniquitoOutput | null;

  // Métodos
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goPrevious: () => void;
  updateStep1: (data: Step1BaseConfig) => void;
  updateStep2: (data: Step2Factors) => void;
  updateStep3: (data: Step3Deductions) => void;
  updateLiveCalculation: (calculation: CalculateFiniquitoOutput) => void;
};

const WizardContext = createContext<WizardState | null>(null);

type WizardProviderProps = {
  children: ReactNode;
};

export function WizardProvider({ children }: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [step1Data, setStep1Data] = useState<Step1BaseConfig | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Factors | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Deductions | null>(null);
  const [liveCalculation, setLiveCalculation] = useState<CalculateFiniquitoOutput | null>(null);

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const goPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const updateStep1 = (data: Step1BaseConfig) => {
    setStep1Data(data);
  };

  const updateStep2 = (data: Step2Factors) => {
    setStep2Data(data);
  };

  const updateStep3 = (data: Step3Deductions) => {
    setStep3Data(data);
  };

  const updateLiveCalculation = (calculation: CalculateFiniquitoOutput) => {
    setLiveCalculation(calculation);
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        step1Data,
        step2Data,
        step3Data,
        liveCalculation,
        goToStep,
        goNext,
        goPrevious,
        updateStep1,
        updateStep2,
        updateStep3,
        updateLiveCalculation,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
}

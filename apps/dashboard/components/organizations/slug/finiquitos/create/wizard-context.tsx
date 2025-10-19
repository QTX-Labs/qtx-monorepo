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

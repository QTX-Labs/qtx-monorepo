'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { Check } from 'lucide-react';

import { WizardProvider, useWizard } from './wizard-context';
import { Step1BaseConfig } from './steps/step1-base-config';
import { Step2Factors } from './steps/step2-factors';
import { Step3Deductions } from './steps/step3-deductions';
import { Step4Review } from './steps/step4-review';
import type { EmpresaSelectorDto } from '~/data/finiquitos/get-empresas-for-selector';

const STEPS = [
  { number: 1, title: 'Configuración', description: 'Datos básicos y prestaciones' },
  { number: 2, title: 'Factores', description: 'Días calculados y ajustables' },
  { number: 3, title: 'Deducciones', description: 'Montos manuales' },
  { number: 4, title: 'Revisión', description: 'Confirmar y guardar' },
] as const;

function StepIndicator() {
  const { currentStep, goToStep, step1Data, step2Data, step3Data } = useWizard();

  const isStepComplete = (step: number) => {
    if (step === 1) return !!step1Data;
    if (step === 2) return !!step2Data;
    if (step === 3) return !!step3Data;
    return false;
  };

  const isStepAccessible = (step: number) => {
    // Step 1 always accessible
    if (step === 1) return true;
    // Step 2 accessible after Step 1 complete
    if (step === 2) return isStepComplete(1);
    // Step 3 accessible after Step 2 complete
    if (step === 3) return isStepComplete(2);
    // Step 4 accessible after Step 3 complete
    if (step === 4) return isStepComplete(3);
    return false;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCurrent = currentStep === step.number;
          const isComplete = isStepComplete(step.number);
          const isAccessible = isStepAccessible(step.number);

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => isAccessible && goToStep(step.number as 1 | 2 | 3 | 4)}
                disabled={!isAccessible}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isComplete && !isCurrent && 'border-primary bg-primary text-primary-foreground',
                  !isCurrent && !isComplete && isAccessible && 'border-muted-foreground hover:border-primary',
                  !isAccessible && 'border-muted cursor-not-allowed opacity-50'
                )}
              >
                {isComplete && !isCurrent ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step.number}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="ml-3 flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  isCurrent && 'text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-full mx-4 hidden md:block',
                    isComplete ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type WizardContentProps = {
  empresas: EmpresaSelectorDto[];
};

function WizardContent({ empresas }: WizardContentProps) {
  const { currentStep } = useWizard();

  return (
    <div className="mt-6">
      {currentStep === 1 && <Step1BaseConfig empresas={empresas} />}
      {currentStep === 2 && <Step2Factors />}
      {currentStep === 3 && <Step3Deductions />}
      {currentStep === 4 && <Step4Review />}
    </div>
  );
}

type FiniquitoWizardProps = {
  initialData?: Parameters<typeof WizardProvider>[0]['initialData'];
  empresas: EmpresaSelectorDto[];
};

export function FiniquitoWizard({ initialData, empresas }: FiniquitoWizardProps) {
  return (
    <WizardProvider initialData={initialData}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Crear Nuevo Finiquito</CardTitle>
          <CardDescription>
            Completa los siguientes pasos para crear un finiquito con cálculos precisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StepIndicator />
          <WizardContent empresas={empresas} />
        </CardContent>
      </Card>
    </WizardProvider>
  );
}

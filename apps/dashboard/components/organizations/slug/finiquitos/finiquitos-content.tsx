'use client';

import { useState } from 'react';
import { PlusIcon, ChevronLeft } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';
import { useAction } from 'next-safe-action/hooks';

import { FiniquitoWizard } from './create/finiquito-wizard';
import { FiniquitosList } from './finiquitos-list';
import { duplicateFiniquito } from '~/actions/finiquitos/duplicate-finiquito';
import { calculateFiniquitoComplete } from '~/lib/finiquitos/calculate-finiquito-complete';
import type { Step1BaseConfig } from '~/lib/finiquitos/schemas/step1-base-config-schema';
import type { Step2Factors } from '~/lib/finiquitos/schemas/step2-factors-schema';
import type { Step3Deductions } from '~/lib/finiquitos/schemas/step3-deductions-schema';
import type { CalculateFiniquitoOutput } from '~/lib/finiquitos/types/calculate-finiquito-types';
import type { EmpresaSelectorDto } from '~/data/finiquitos/get-empresas-for-selector';
import type { FiniquitoListItem } from '~/data/finiquitos/get-finiquitos';

interface FiniquitosContentProps {
  finiquitos: FiniquitoListItem[];
  empresas: EmpresaSelectorDto[];
  isAdmin: boolean;
}

type WizardInitialData = {
  step1?: Step1BaseConfig;
  step2?: Step2Factors;
  step3?: Step3Deductions;
  liveCalculation?: CalculateFiniquitoOutput;
} | undefined;

export function FiniquitosContent({ finiquitos, empresas, isAdmin }: FiniquitosContentProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<WizardInitialData>(undefined);

  const { execute: executeDuplicate, isExecuting: isDuplicating } = useAction(duplicateFiniquito, {
    onSuccess: ({ data }) => {
      if (!data) return;

      const { step1, step2, step3 } = data;

      // Calculate initial live calculation with the mapped data
      const liveCalculation = calculateFiniquitoComplete({
        ...step1,
        ...step2,
        ...step3,
      });

      // Set wizard initial data
      setWizardInitialData({
        step1,
        step2,
        step3,
        liveCalculation,
      });

      // Show wizard
      setIsCreating(true);
    },
    onError: ({ error }) => {
      console.error('Error duplicating finiquito:', error);
      toast.error('Error al duplicar el finiquito');
    },
  });

  const handleDuplicateClick = (finiquitoId: string) => {
    executeDuplicate({ finiquitoId });
  };

  const handleCreateNew = () => {
    setWizardInitialData(undefined); // Clear initial data for new finiquito
    setIsCreating(true);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isCreating && (
              <Button
                onClick={() => setIsCreating(false)}
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Volver a la lista"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="space-y-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isCreating ? 'Nuevo Finiquito' : 'Historial de Finiquitos'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isCreating
                  ? 'Completa los datos para calcular el finiquito'
                  : `${finiquitos.length} ${finiquitos.length === 1 ? 'finiquito registrado' : 'finiquitos registrados'}`
                }
              </p>
            </div>
          </div>
          {!isCreating && (
            <Button onClick={handleCreateNew} size="default" className="gap-2 shrink-0 w-full sm:w-auto">
              <PlusIcon className="h-4 w-4" />
              Crear Finiquito
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {isCreating ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <FiniquitoWizard initialData={wizardInitialData} empresas={empresas} />
        </div>
      ) : (
        <FiniquitosList finiquitos={finiquitos} onDuplicateClick={handleDuplicateClick} />
      )}
    </div>
  );
}

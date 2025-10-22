'use client';

import { useState } from 'react';
import { PlusIcon, ChevronLeft } from 'lucide-react';
import { type Finiquito, type User } from '@workspace/database';

import { Button } from '@workspace/ui/components/button';

import { FiniquitoWizard } from './create/finiquito-wizard';
import { FiniquitosList } from './finiquitos-list';

type FiniquitoListItem = Pick<
  Finiquito,
  | 'id'
  | 'employeeName'
  | 'empresaName'
  | 'clientName'
  | 'hireDate'
  | 'terminationDate'
  | 'salary'
  | 'salaryFrequency'
  | 'borderZone'
  | 'totalToPay'
  | 'totalAPagar'
  | 'version'
  | 'createdAt'
  | 'gratificationDays'
> & {
  user: Pick<User, 'name' | 'email'>;
};

interface FiniquitosContentProps {
  finiquitos: FiniquitoListItem[];
  isAdmin: boolean;
}

export function FiniquitosContent({ finiquitos, isAdmin }: FiniquitosContentProps) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6 py-6">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {isCreating && (
            <Button
              onClick={() => setIsCreating(false)}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label="Volver a la lista"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
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
          <Button onClick={() => setIsCreating(true)} size="default" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Crear Finiquito
          </Button>
        )}
      </div>

      {/* Content Section */}
      {isCreating ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <FiniquitoWizard />
        </div>
      ) : (
        <FiniquitosList finiquitos={finiquitos} />
      )}
    </div>
  );
}

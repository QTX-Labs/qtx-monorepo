'use client';

import { useState } from 'react';
import { PlusIcon, ChevronLeft } from 'lucide-react';
import { type Finiquito, type User } from '@workspace/database';

import { Button } from '@workspace/ui/components/button';

import { FiniquitoForm } from './finiquito-form';
import { FiniquitosList } from './finiquitos-list';

type FiniquitoListItem = Pick<
  Finiquito,
  | 'id'
  | 'employeeName'
  | 'hireDate'
  | 'terminationDate'
  | 'salary'
  | 'salaryFrequency'
  | 'borderZone'
  | 'totalToPay'
  | 'createdAt'
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
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2">
          {isCreating && (
            <button
              onClick={() => setIsCreating(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
              aria-label="Volver a la lista"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isCreating ? 'Nuevo Finiquito' : 'Finiquitos'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isCreating
                ? 'Completa los datos para calcular el finiquito'
                : `${finiquitos.length} ${finiquitos.length === 1 ? 'finiquito registrado' : 'finiquitos registrados'}`
              }
            </p>
          </div>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} size="lg" className="px-6">
            <PlusIcon className="mr-2 h-4 w-4" />
            Crear Finiquito
          </Button>
        )}
      </div>

      {isCreating ? (
        <FiniquitoForm onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} isAdmin={isAdmin} />
      ) : (
        <div className="px-4 sm:px-6 lg:px-8">
          <FiniquitosList finiquitos={finiquitos} />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
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
}

export function FiniquitosContent({ finiquitos }: FiniquitosContentProps) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6">
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
        <Button onClick={() => setIsCreating(!isCreating)} size="lg" className="px-6">
          <PlusIcon className="mr-2 h-4 w-4" />
          {isCreating ? 'Ver Lista' : 'Crear Finiquito'}
        </Button>
      </div>

      {isCreating ? (
        <FiniquitoForm onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />
      ) : (
        <div className="px-4 sm:px-6 lg:px-8">
          <FiniquitosList finiquitos={finiquitos} />
        </div>
      )}
    </div>
  );
}

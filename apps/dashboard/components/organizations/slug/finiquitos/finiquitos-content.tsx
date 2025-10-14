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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreating(!isCreating)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {isCreating ? 'Ver Lista' : 'Crear Finiquito'}
        </Button>
      </div>

      {isCreating ? (
        <FiniquitoForm onCancel={() => setIsCreating(false)} />
      ) : (
        <FiniquitosList finiquitos={finiquitos} />
      )}
    </div>
  );
}

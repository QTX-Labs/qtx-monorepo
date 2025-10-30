import { cache } from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { prisma } from '@workspace/database/client';
import type { Finiquito, User } from '@workspace/database';

/**
 * Tipo de retorno para la lista de finiquitos.
 * Los campos Decimal han sido convertidos a number para compatibilidad con Client Components.
 */
export type FiniquitoListItem = Omit<
  Pick<
    Finiquito,
    | 'id'
    | 'employeeName'
    | 'employeePosition'
    | 'customFiniquitoIdentifier'
    | 'empresaName'
    | 'clientName'
    | 'hireDate'
    | 'terminationDate'
    | 'salary'
    | 'salaryFrequency'
    | 'borderZone'
    | 'totalToPay'
    | 'totalAPagar'
    | 'liquidacionActivada'
    | 'complementoActivado'
    | 'gratificationDays'
    | 'version'
    | 'createdAt'
  >,
  'salary' | 'totalToPay' | 'totalAPagar' | 'gratificationDays'
> & {
  salary: number;
  totalToPay: number | null;
  totalAPagar: number | null;
  gratificationDays: number | null;
  user: Pick<User, 'name' | 'email'>;
};

/**
 * Obtiene la lista de finiquitos de la organización
 *
 * NOTA: Incluye campos para ambas versiones:
 * - version 1 (legacy): totalToPay
 * - version 2 (nueva estructura): totalAPagar, liquidacionActivada, complementoActivado
 *
 * El frontend debe verificar el campo `version` para determinar qué campos usar.
 */
export const getFiniquitos = cache(async (): Promise<FiniquitoListItem[]> => {
  const ctx = await getAuthOrganizationContext();

  const finiquitos = await prisma.finiquito.findMany({
    where: {
      organizationId: ctx.organization.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      employeeName: true,
      employeePosition: true,
      customFiniquitoIdentifier: true,
      empresaName: true,
      clientName: true,
      hireDate: true,
      terminationDate: true,
      salary: true,
      salaryFrequency: true,
      borderZone: true,

      // Campos legacy (v1)
      totalToPay: true,

      // Campos nuevos (v2)
      version: true,
      totalAPagar: true,
      liquidacionActivada: true,
      complementoActivado: true,
      gratificationDays: true,

      createdAt: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  // Convert Decimal fields to numbers for client compatibility
  return finiquitos.map(finiquito => ({
    ...finiquito,
    salary: finiquito.salary.toNumber(),
    totalToPay: finiquito.totalToPay?.toNumber() ?? null,
    totalAPagar: finiquito.totalAPagar?.toNumber() ?? null,
    gratificationDays: finiquito.gratificationDays?.toNumber() ?? null,
  }));
});

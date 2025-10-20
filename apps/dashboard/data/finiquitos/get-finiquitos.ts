import { cache } from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { prisma } from '@workspace/database/client';

/**
 * Obtiene la lista de finiquitos de la organización
 *
 * NOTA: Incluye campos para ambas versiones:
 * - version 1 (legacy): totalToPay
 * - version 2 (nueva estructura): totalAPagar, liquidacionActivada, complementoActivado
 *
 * El frontend debe verificar el campo `version` para determinar qué campos usar.
 */
export const getFiniquitos = cache(async () => {
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
      empresaName: true,
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

      createdAt: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return finiquitos;
});

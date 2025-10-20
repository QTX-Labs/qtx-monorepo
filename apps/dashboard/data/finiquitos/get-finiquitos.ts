import { cache } from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { prisma } from '@workspace/database/client';

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
      empresaName: true,
      hireDate: true,
      terminationDate: true,
      salary: true,
      salaryFrequency: true,
      borderZone: true,
      totalToPay: true,
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

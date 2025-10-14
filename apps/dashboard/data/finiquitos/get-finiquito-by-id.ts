import { cache } from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { prisma } from '@workspace/database/client';
import { NotFoundError } from '@workspace/common/errors';

export const getFiniquitoById = cache(async (id: string) => {
  const ctx = await getAuthOrganizationContext();

  const finiquito = await prisma.finiquito.findUnique({
    where: {
      id,
      organizationId: ctx.organization.id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      attachments: true
    }
  });

  if (!finiquito) {
    throw new NotFoundError('Finiquito no encontrado');
  }

  return finiquito;
});

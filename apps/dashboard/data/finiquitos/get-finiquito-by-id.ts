import { cache } from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { prisma } from '@workspace/database/client';
import { NotFoundError } from '@workspace/common/errors';

/**
 * Obtiene un finiquito por ID
 *
 * NOTA: Esta función retorna todos los campos del modelo Finiquito, incluyendo:
 * - Campos legacy (version 1): fiscalAguinaldoFactor, realAguinaldoAmount, etc.
 * - Campos nuevos (version 2): factorDiasTrabajadosFiniquito, montoAguinaldoFiniquito, etc.
 *
 * El frontend debe verificar el campo `version` para determinar qué campos usar.
 */
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

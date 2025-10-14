'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@workspace/database/client';
import { NotFoundError } from '@workspace/common/errors';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { authOrganizationActionClient } from '~/actions/safe-action';

const deleteFiniquitoSchema = z.object({
  id: z.string().cuid()
});

export const deleteFiniquito = authOrganizationActionClient
  .metadata({ actionName: 'deleteFiniquito' })
  .inputSchema(deleteFiniquitoSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Verificar que el finiquito existe y pertenece a la organización
    const existing = await prisma.finiquito.findUnique({
      where: { id: parsedInput.id, organizationId: ctx.organization.id }
    });

    if (!existing) {
      throw new NotFoundError('Finiquito no encontrado');
    }

    // Eliminar finiquito y sus adjuntos
    await prisma.finiquito.delete({
      where: { id: parsedInput.id }
    });

    revalidatePath(
      replaceOrgSlug(
        routes.dashboard.organizations.slug.Finiquitos,
        ctx.organization.slug
      )
    );

    return { success: true };
  });

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@workspace/database/client';
import { NotFoundError } from '@workspace/common/errors';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { authOrganizationActionClient } from '~/actions/safe-action';

const deleteFiniquitoSchema = z.object({
  id: z.string().uuid()
});

export const deleteFiniquito = authOrganizationActionClient
  .metadata({ actionName: 'deleteFiniquito' })
  .inputSchema(deleteFiniquitoSchema)
  .action(async ({ parsedInput, ctx }) => {
    console.log('[deleteFiniquito] START - ID:', parsedInput.id, 'Org:', ctx.organization.id);

    // Verificar que el finiquito existe y pertenece a la organización
    const existing = await prisma.finiquito.findFirst({
      where: {
        id: parsedInput.id,
        organizationId: ctx.organization.id
      }
    });

    if (!existing) {
      console.error('[deleteFiniquito] ❌ Finiquito no encontrado');
      throw new NotFoundError('Finiquito no encontrado');
    }

    console.log('[deleteFiniquito] Finiquito encontrado, eliminando...');

    // Eliminar finiquito y sus adjuntos (cascade automático)
    await prisma.finiquito.delete({
      where: { id: parsedInput.id }
    });

    console.log('[deleteFiniquito] ✅ Finiquito eliminado exitosamente');

    revalidatePath(
      replaceOrgSlug(
        routes.dashboard.organizations.slug.Finiquitos,
        ctx.organization.slug
      )
    );

    return { success: true };
  });

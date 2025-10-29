'use server';

import { revalidateTag } from 'next/cache';

import { prisma } from '@workspace/database/client';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';
import { deleteContactPersonSchema } from '~/schemas/contacts/delete-contact-person-schema';

export const deleteContactPerson = authOrganizationActionClient
  .metadata({ actionName: 'deleteContactPerson' })
  .inputSchema(deleteContactPersonSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Verify contact person belongs to organization
    const contactPerson = await prisma.contactPerson.findFirst({
      where: {
        id: parsedInput.id,
        contact: {
          organizationId: ctx.organization.id
        }
      },
      select: {
        id: true,
        contactId: true
      }
    });

    if (!contactPerson) {
      throw new Error('Contact person not found');
    }

    await prisma.contactPerson.delete({
      where: {
        id: parsedInput.id
      }
    });

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contact,
        ctx.organization.id,
        contactPerson.contactId
      )
    );
  });

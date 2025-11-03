'use server';

import { revalidateTag } from 'next/cache';

import { prisma } from '@workspace/database/client';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';
import { updateContactPersonSchema } from '~/schemas/contacts/update-contact-person-schema';

export const updateContactPerson = authOrganizationActionClient
  .metadata({ actionName: 'updateContactPerson' })
  .inputSchema(updateContactPersonSchema)
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

    // If this is set as primary, unset any existing primary
    if (parsedInput.isPrimary) {
      await prisma.contactPerson.updateMany({
        where: {
          contactId: contactPerson.contactId,
          isPrimary: true,
          id: {
            not: parsedInput.id
          }
        },
        data: {
          isPrimary: false
        }
      });
    }

    await prisma.contactPerson.update({
      where: {
        id: parsedInput.id
      },
      data: {
        name: parsedInput.name,
        position: parsedInput.position || undefined,
        email: parsedInput.email || undefined,
        phone: parsedInput.phone || undefined,
        isPrimary: parsedInput.isPrimary
      },
      select: {
        id: true // SELECT NONE
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

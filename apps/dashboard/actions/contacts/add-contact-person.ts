'use server';

import { revalidateTag } from 'next/cache';

import { prisma } from '@workspace/database/client';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';
import { addContactPersonSchema } from '~/schemas/contacts/add-contact-person-schema';

export const addContactPerson = authOrganizationActionClient
  .metadata({ actionName: 'addContactPerson' })
  .inputSchema(addContactPersonSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check if contact belongs to the organization
    const contact = await prisma.contact.findFirst({
      where: {
        id: parsedInput.contactId,
        organizationId: ctx.organization.id
      },
      select: {
        id: true,
        _count: {
          select: {
            contactPersons: true
          }
        }
      }
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Enforce maximum 3 contact persons per contact
    if (contact._count.contactPersons >= 3) {
      throw new Error('Maximum 3 contact persons allowed per contact');
    }

    // If this is set as primary, unset any existing primary
    if (parsedInput.isPrimary) {
      await prisma.contactPerson.updateMany({
        where: {
          contactId: parsedInput.contactId,
          isPrimary: true
        },
        data: {
          isPrimary: false
        }
      });
    }

    await prisma.contactPerson.create({
      data: {
        contactId: parsedInput.contactId,
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
        parsedInput.contactId
      )
    );
  });

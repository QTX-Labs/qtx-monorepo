'use server';

import { revalidateTag } from 'next/cache';

import { NotFoundError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';

import { updateContactAndCaptureEvent } from '~/actions/contacts/_contact-event-capture';
import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';
import { updateContactPropertiesSchema } from '~/schemas/contacts/update-contact-properties-schema';

export const updateContactProperties = authOrganizationActionClient
  .metadata({ actionName: 'updateContactProperties' })
  .inputSchema(updateContactPropertiesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const count = await prisma.contact.count({
      where: {
        organizationId: ctx.organization.id,
        id: parsedInput.id
      }
    });
    if (count < 1) {
      throw new NotFoundError('Contact not found');
    }

    await updateContactAndCaptureEvent(
      parsedInput.id,
      {
        record: parsedInput.record,
        type: parsedInput.type,
        name: parsedInput.name,
        businessName: parsedInput.businessName || null,
        email: parsedInput.email || null,
        address: parsedInput.address || null,
        fiscalAddress: parsedInput.fiscalAddress || null,
        fiscalPostalCode: parsedInput.fiscalPostalCode || null,
        rfc: parsedInput.rfc || null,
        businessActivity: parsedInput.businessActivity || null,
        taxRegime: parsedInput.taxRegime || null,
        phone: parsedInput.phone || null
      },
      ctx.session.user.id
    );

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contacts,
        ctx.organization.id
      )
    );
    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contact,
        ctx.organization.id,
        parsedInput.id
      )
    );

    for (const membership of ctx.organization.memberships) {
      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Favorites,
          ctx.organization.id,
          membership.userId
        )
      );
    }
  });

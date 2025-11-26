import 'server-only';

import { unstable_cache as cache } from 'next/cache';
import { notFound } from 'next/navigation';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { ValidationError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';
import {
  getContactSchema,
  type GetContactSchema
} from '~/schemas/contacts/get-contact-schema';
import type { ContactDto } from '~/types/dtos/contact-dto';

export async function getContact(input: GetContactSchema): Promise<ContactDto> {
  const ctx = await getAuthOrganizationContext();

  const result = getContactSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(JSON.stringify(result.error.flatten()));
  }
  const parsedInput = result.data;

  return cache(
    async () => {
      const contact = await prisma.contact.findFirst({
        where: {
          organizationId: ctx.organization.id,
          id: parsedInput.id
        },
        select: {
          id: true,
          record: true,
          type: true,
          image: true,
          name: true,
          businessName: true,
          email: true,
          address: true,
          fiscalAddress: true,
          fiscalPostalCode: true,
          rfc: true,
          businessActivity: true,
          taxRegime: true,
          phone: true,
          stage: true,
          createdAt: true,
          tags: {
            select: {
              id: true,
              text: true
            }
          },
          contactPersons: {
            select: {
              id: true,
              contactId: true,
              name: true,
              position: true,
              email: true,
              phone: true,
              isPrimary: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ]
          }
        }
      });
      if (!contact) {
        return notFound();
      }

      const response: ContactDto = {
        id: contact.id,
        record: contact.record,
        type: contact.type ?? undefined,
        image: contact.image ? contact.image : undefined,
        name: contact.name,
        businessName: contact.businessName ?? undefined,
        email: contact.email ? contact.email : undefined,
        address: contact.address ? contact.address : undefined,
        fiscalAddress: contact.fiscalAddress ?? undefined,
        fiscalPostalCode: contact.fiscalPostalCode ?? undefined,
        rfc: contact.rfc ?? undefined,
        businessActivity: contact.businessActivity ?? undefined,
        taxRegime: contact.taxRegime ?? undefined,
        phone: contact.phone ? contact.phone : undefined,
        stage: contact.stage,
        createdAt: contact.createdAt,
        tags: contact.tags,
        contactPersons: contact.contactPersons.map(cp => ({
          id: cp.id,
          contactId: cp.contactId,
          name: cp.name,
          position: cp.position ?? undefined,
          email: cp.email ?? undefined,
          phone: cp.phone ?? undefined,
          isPrimary: cp.isPrimary,
          createdAt: cp.createdAt,
          updatedAt: cp.updatedAt
        }))
      };

      return response;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Contact,
      ctx.organization.id,
      parsedInput.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contact,
          ctx.organization.id,
          parsedInput.id
        )
      ]
    }
  )();
}

import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { ValidationError } from '@workspace/common/errors';
import { ContactRecord, ContactType, Prisma } from '@workspace/database';
import { prisma } from '@workspace/database/client';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';
import {
  getContactsSchema,
  RecordsOption,
  type GetContactsSchema
} from '~/schemas/contacts/get-contacts-schema';
import type { ContactDto } from '~/types/dtos/contact-dto';

export async function getMisEmpresasContacts(
  input: GetContactsSchema
): Promise<{
  contacts: ContactDto[];
  filteredCount: number;
  totalCount: number;
}> {
  const ctx = await getAuthOrganizationContext();

  const result = getContactsSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(JSON.stringify(result.error.flatten()));
  }
  const parsedInput = result.data;

  const searchCriteria: Prisma.StringFilter | undefined =
    parsedInput.searchQuery
      ? { contains: parsedInput.searchQuery, mode: 'insensitive' }
      : undefined;
  const searchVector = searchCriteria
    ? [{ name: searchCriteria }, { email: searchCriteria }]
    : undefined;

  return cache(
    async () => {
      const [contacts, filteredCount, totalCount] = await prisma.$transaction([
        prisma.contact.findMany({
          skip: parsedInput.pageIndex * parsedInput.pageSize,
          take: parsedInput.pageSize,
          where: {
            organizationId: ctx.organization.id,
            type: ContactType.EMISOR,
            record: mapRecords(parsedInput.records),
            tags:
              parsedInput.tags && parsedInput.tags.length > 0
                ? { some: { text: { in: parsedInput.tags } } }
                : undefined,
            OR: searchVector
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
            }
          },
          orderBy: {
            [parsedInput.sortBy]: parsedInput.sortDirection
          }
        }),
        prisma.contact.count({
          where: {
            organizationId: ctx.organization.id,
            type: ContactType.EMISOR,
            record: mapRecords(parsedInput.records),
            tags:
              parsedInput.tags && parsedInput.tags.length > 0
                ? { some: { text: { in: parsedInput.tags } } }
                : undefined,
            OR: searchVector
          }
        }),
        prisma.contact.count({
          where: {
            organizationId: ctx.organization.id,
            type: ContactType.EMISOR
          }
        })
      ]);

      const mapped: ContactDto[] = contacts.map((contact) => ({
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
        contactPersons: []
      }));

      return { contacts: mapped, filteredCount, totalCount };
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Contacts,
      ctx.organization.id,
      'mis-empresas',
      parsedInput.pageIndex.toString(),
      parsedInput.pageSize.toString(),
      parsedInput.sortBy,
      parsedInput.sortDirection,
      parsedInput.tags.join(','),
      parsedInput.records?.toString() ?? '',
      parsedInput.searchQuery?.toString() ?? ''
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contacts,
          ctx.organization.id
        )
      ]
    }
  )();
}

function mapRecords(option: RecordsOption): ContactRecord | undefined {
  switch (option) {
    case RecordsOption.People:
      return ContactRecord.PERSON;
    case RecordsOption.Companies:
      return ContactRecord.COMPANY;
  }

  return undefined;
}

import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { ContactRecord, ContactType } from '@workspace/database';
import { prisma } from '@workspace/database/client';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';

export type EmpresaSelectorDto = {
  id: string;
  name: string;
  rfc: string | null;
};

/**
 * Obtiene todas las empresas (Contactos tipo EMISOR + COMPANY) del tenant
 * para mostrar en selectores/comboboxes.
 *
 * Esta función es específica para el selector de empresas en el wizard de finiquitos.
 */
export async function getEmpresasForSelector(): Promise<EmpresaSelectorDto[]> {
  const ctx = await getAuthOrganizationContext();

  return cache(
    async () => {
      const contacts = await prisma.contact.findMany({
        where: {
          organizationId: ctx.organization.id,
          type: ContactType.EMISOR,
          record: ContactRecord.COMPANY,
        },
        select: {
          id: true,
          name: true,
          businessName: true,
          rfc: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Mapear contactos a formato simple para el selector
      const mapped: EmpresaSelectorDto[] = contacts.map((contact) => ({
        id: contact.id,
        name: contact.businessName || contact.name, // Priorizar businessName, fallback a name
        rfc: contact.rfc,
      }));

      return mapped;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Contacts,
      ctx.organization.id,
      'empresas-selector'
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

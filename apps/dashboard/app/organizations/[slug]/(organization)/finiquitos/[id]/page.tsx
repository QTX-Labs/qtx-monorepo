import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';

import { FiniquitoDetailContent } from '~/components/organizations/slug/finiquitos/finiquito-detail-content';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { getFiniquitoById } from '~/data/finiquitos/get-finiquito-by-id';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Detalle de Finiquito')
};

interface FiniquitoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FiniquitoDetailPage({
  params
}: FiniquitoDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const finiquito = await getFiniquitoById(id);

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title={`Finiquito - ${finiquito.employeeName}`}
              info="Detalle de la liquidación laboral"
            />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <FiniquitoDetailContent finiquito={finiquito} />
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}

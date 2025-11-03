import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { isCurrentUserAdminOrOwner } from '@workspace/auth/permissions';

import { FiniquitosContent } from '~/components/organizations/slug/finiquitos/finiquitos-content';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { getFiniquitos } from '~/data/finiquitos/get-finiquitos';
import { getEmpresasForSelector } from '~/data/finiquitos/get-empresas-for-selector';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Finiquitos')
};

export default async function FiniquitosPage(): Promise<React.JSX.Element> {
  const finiquitos = await getFiniquitos();
  const empresas = await getEmpresasForSelector();
  const isAdmin = await isCurrentUserAdminOrOwner();

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Finiquitos"
              info="Cálculo de liquidaciones laborales"
            />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <FiniquitosContent finiquitos={finiquitos} empresas={empresas} isAdmin={isAdmin} />
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}

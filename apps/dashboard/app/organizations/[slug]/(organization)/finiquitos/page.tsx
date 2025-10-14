import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';

import { FiniquitosContent } from '~/components/organizations/slug/finiquitos/finiquitos-content';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { getFiniquitos } from '~/data/finiquitos/get-finiquitos';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Finiquitos')
};

export default async function FiniquitosPage(): Promise<React.JSX.Element> {
  const finiquitos = await getFiniquitos();

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
          <FiniquitosContent finiquitos={finiquitos} />
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}

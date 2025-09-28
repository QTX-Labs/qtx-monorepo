'use client';

import * as React from 'react';

import { PricingTable } from '@workspace/billing/components/pricing-table';
import { APP_NAME } from '@workspace/common/app';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

export function PricingHero(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-12 py-20">
        <SiteHeading
          badge="Precios"
          title="Planes que crecen con tu empresa"
          description={`Desde microempresas hasta corporativos con miles de empleados, ${APP_NAME} es la solución de nómina perfecta para México.`}
        />
        <PricingTable />
      </div>
    </GridSection>
  );
}

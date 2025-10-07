'use client';

import * as React from 'react';

import { PricingTable } from '@workspace/billing/components/pricing-table';
import { APP_NAME } from '@workspace/common/app';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

export function PricingHero(): React.JSX.Element {
  return (
    <GridSection className="relative overflow-hidden">
      {/* Decorative organic shapes */}
      <div className="absolute left-1/4 top-20 size-64 animate-float-large rounded-full bg-sunny-yellow opacity-10 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 size-80 animate-rotate-slow rounded-full bg-cool-cyan opacity-10 blur-3xl" />
      <div className="absolute right-10 top-10 size-40 blob-shape-2 animate-pulse-scale bg-neon-lime opacity-10" />

      <div className="container relative z-10 space-y-12 py-20">
        <SiteHeading
          badge="precios"
          title="planes que crecen con tu empresa"
          description={`desde microempresas hasta corporativos con miles de empleados, ${APP_NAME} es la solución de nómina perfecta para méxico.`}
        />
        <PricingTable />
      </div>
    </GridSection>
  );
}

import * as React from 'react';
import type { Metadata } from 'next';

import { PricingFAQ } from '~/components/sections/pricing-faq';
import { PricingHero } from '~/components/sections/pricing-hero';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Precios'),
  description: 'Planes y precios de Quantix. Software de nómina para México con cálculo automático IMSS, ISR, CFDI 4.0. Portal de empleados y CRM incluidos.',
  keywords: ['precios nómina', 'costo software nómina', 'planes nómina México', 'software recursos humanos precio']
};

export default function PricingPage(): React.JSX.Element {
  return (
    <>
      <PricingHero />
      <PricingFAQ />
    </>
  );
}

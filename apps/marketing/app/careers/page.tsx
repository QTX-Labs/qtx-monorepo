import * as React from 'react';
import type { Metadata } from 'next';

import { CareersBenefits } from '~/components/sections/careers-benefits';
import { CareersPositions } from '~/components/sections/careers-positions';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Carreras'),
  description: 'Únete a Quantix, startup Y Combinator construyendo el futuro de nómina con IA. Posiciones en San Francisco y Ciudad de México.',
  keywords: ['trabajos tech México', 'empleos IA', 'startup Y Combinator', 'trabajo remoto México', 'ingeniería software']
};

export default function CareersPage(): React.JSX.Element {
  return (
    <>
      <CareersBenefits />
      <CareersPositions />
    </>
  );
}

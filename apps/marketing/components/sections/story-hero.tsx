import * as React from 'react';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

export function StoryHero(): React.JSX.Element {
  return (
    <GridSection hideVerticalGridLines>
      <div className="container py-24 md:py-32">
        <SiteHeading
          badge="Nuestra Historia"
          title="De México para el mundo, con apoyo de Y Combinator"
          description="Fundada por mexicanos en Silicon Valley y acelerada por Y Combinator (W23), Quantix está transformando la gestión de capital humano en México. Con el respaldo de inversionistas estadounidenses que creen en el talento mexicano, estamos construyendo el futuro de la nómina y el reclutamiento."
        />
      </div>
    </GridSection>
  );
}

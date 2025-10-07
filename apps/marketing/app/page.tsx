import * as React from 'react';

import { VisualBreak } from '~/components/fragments/visual-break';
import { CTA } from '~/components/sections/cta';
import { FAQ } from '~/components/sections/faq';
import { Hero } from '~/components/sections/hero';
import { Logos } from '~/components/sections/logos';
import { Problem } from '~/components/sections/problem';
import { Solution } from '~/components/sections/solution';
import { Stats } from '~/components/sections/stats';
import { Testimonials } from '~/components/sections/testimonials';

export default function IndexPage(): React.JSX.Element {
  return (
    <>
      <Hero />

      <VisualBreak variant="simple" />

      <Logos />

      <VisualBreak variant="dots" />

      <Problem />

      <VisualBreak variant="gradient" />

      <Solution />

      {/* Stats con su propio fondo no necesita break antes */}
      <Stats />

      <VisualBreak variant="wave" />

      <Testimonials />

      <VisualBreak variant="simple" />

      <FAQ />

      {/* CTA con su propio fondo no necesita break antes */}
      <CTA />
    </>
  );
}

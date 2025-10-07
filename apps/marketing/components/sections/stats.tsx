import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { NumberTicker } from '~/components/fragments/number-ticket';

const DATA = [
  {
    value: 70,
    suffix: '%',
    description: 'menos tiempo en nómina'
  },
  {
    value: 100,
    suffix: '%',
    description: 'cumplimiento SAT/IMSS'
  },
  {
    value: 89,
    suffix: 'K',
    description: 'evitadas en multas promedio'
  },
  {
    value: 15,
    suffix: ' días',
    description: 'ahorrados al mes en RH'
  }
];

export function Stats(): React.JSX.Element {
  return (
    <GridSection className="relative overflow-hidden bg-primary">
      {/* Decorative shapes */}
      <div className="absolute left-1/4 top-10 size-64 animate-pulse-scale rounded-full bg-primary-darker opacity-30 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 size-80 animate-float-large rounded-full bg-primary-dark opacity-40 blur-3xl" />
      <div className="absolute right-20 top-20 size-40 blob-shape-2 animate-rotate-slow bg-neon-lime opacity-10" />

      <div className="container relative z-10 py-24">
        {/* Section divider */}
        <div className="mb-16 text-center">
          <div className="mx-auto h-1 w-32 rounded-full bg-gradient-to-r from-neon-lime via-sunny-yellow to-neon-lime" />
          <h3 className="mt-8 text-2xl font-black lowercase tracking-tight text-primary-foreground md:text-3xl">
            números que hablan por sí solos
          </h3>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {DATA.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'group relative overflow-hidden rounded-3xl bg-white/10 p-8 text-center backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20',
                'border-2 border-white/20'
              )}
            >
              {/* Decorative blob per card */}
              <div className="absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-neon-lime opacity-0 blur-2xl transition-opacity group-hover:opacity-30" />

              <div className="relative z-10">
                <p className="mb-2 text-5xl font-black text-primary-foreground md:text-6xl">
                  <NumberTicker value={stat.value} />
                  {stat.suffix}
                </p>
                <p className="text-sm font-medium lowercase text-primary-foreground/90">
                  {stat.description}
                </p>
              </div>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-neon-lime to-sunny-yellow opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}

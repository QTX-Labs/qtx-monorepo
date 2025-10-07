import * as React from 'react';
import { BarChartIcon, UserPlusIcon, WorkflowIcon } from 'lucide-react';

import { BlurFade } from '~/components/fragments/blur-fade';
import { GridSection } from '~/components/fragments/grid-section';
import { TextGenerateWithSelectBoxEffect } from '~/components/fragments/text-generate-with-select-box-effect';

const DATA = [
  {
    icon: <UserPlusIcon className="size-5 shrink-0" />,
    title: 'Errores costosos en cálculos',
    description:
      'Un error en ISR o IMSS puede significar multas de hasta $89,170 MXN por trabajador. El 67% de PyMEs mexicanas han recibido multas por errores en nómina.'
  },
  {
    icon: <BarChartIcon className="size-5 shrink-0" />,
    title: 'Procesos manuales interminables',
    description:
      'Los equipos de RH dedican hasta 15 días al mes procesando nómina manualmente, tiempo que podrían invertir en estrategias de crecimiento.'
  },
  {
    icon: <WorkflowIcon className="size-5 shrink-0" />,
    title: 'Cambios regulatorios constantes',
    description:
      'SAT e IMSS actualizan sus regulaciones 3-5 veces al año. Mantenerse actualizado requiere capacitación constante y sistemas flexibles.'
  }
];

export function Problem(): React.JSX.Element {
  return (
    <GridSection className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Decorative blobs */}
      <div className="absolute left-10 top-20 size-96 animate-float-large rounded-full bg-heart-red opacity-5 blur-3xl" />
      <div className="absolute bottom-20 right-10 size-80 animate-rotate-slow rounded-full bg-warm-orange opacity-5 blur-3xl" />

      <div className="container relative z-10 py-32">
        {/* Section header with visual break */}
        <div className="mb-20 text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-destructive/10">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="mx-auto max-w-3xl text-4xl font-black lowercase leading-tight tracking-super-tight md:text-6xl">
            <TextGenerateWithSelectBoxEffect words="los 3 problemas que te cuestan millones" />
          </h2>
          <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-heart-red via-warm-orange to-heart-red" />
        </div>

        {/* Cards with better visual separation */}
        <div className="grid gap-8 md:grid-cols-3">
          {DATA.map((statement, index) => (
            <BlurFade
              key={index}
              inView
              delay={0.2 + index * 0.2}
            >
              <div className="group relative h-full overflow-hidden rounded-3xl border-2 border-border bg-card p-8 transition-all hover:scale-105 hover:border-heart-red/50 hover:shadow-2xl">
                {/* Decorative element */}
                <div className="absolute right-0 top-0 size-32 translate-x-12 -translate-y-12 rounded-full bg-heart-red opacity-10 blur-2xl transition-all group-hover:opacity-20" />

                <div className="relative z-10">
                  <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-heart-red/20 to-warm-orange/20 shadow-lg transition-transform group-hover:scale-110">
                    {statement.icon}
                  </div>
                  <h3 className="mb-4 text-xl font-bold lowercase tracking-tight">{statement.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{statement.description}</p>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-heart-red to-warm-orange opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </GridSection>
  );
}

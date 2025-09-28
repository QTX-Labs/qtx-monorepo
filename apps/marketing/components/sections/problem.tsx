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
    <GridSection>
      <div className="px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold md:text-5xl">
          <TextGenerateWithSelectBoxEffect words="Los 3 problemas que te cuestan millones" />
        </h2>
      </div>
      <div className="grid divide-y border-t border-dashed md:grid-cols-3 md:divide-x md:divide-y-0">
        {DATA.map((statement, index) => (
          <BlurFade
            key={index}
            inView
            delay={0.2 + index * 0.2}
            className="border-dashed px-8 py-12"
          >
            <div className="mb-7 flex size-12 items-center justify-center rounded-2xl border bg-background shadow">
              {statement.icon}
            </div>
            <h3 className="mb-3 text-lg font-semibold">{statement.title}</h3>
            <p className="text-muted-foreground">{statement.description}</p>
          </BlurFade>
        ))}
      </div>
    </GridSection>
  );
}

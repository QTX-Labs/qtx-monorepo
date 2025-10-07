import * as React from 'react';
import { CircleCheckBigIcon } from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';

import { AiAdvisorCard } from '~/components/cards/ai-advisor-card';
import { BentoAnalyticsCard } from '~/components/cards/bento-analytics-card';
import { BentoCampaignsCard } from '~/components/cards/bento-campaigns-card';
import { BentoCustomersCard } from '~/components/cards/bento-customers-card';
import { BentoMagicInboxCard } from '~/components/cards/bento-magic-inbox-card';
import { BentoPipelinesCard } from '~/components/cards/bento-pipelines-card';
import { GridSection } from '~/components/fragments/grid-section';

export function Solution(): React.JSX.Element {
  return (
    <GridSection className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute left-0 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 animate-rotate-slow rounded-full bg-cool-cyan opacity-5 blur-3xl" />
      <div className="absolute bottom-0 right-0 size-[800px] translate-x-1/2 translate-y-1/2 animate-float-large rounded-full bg-neon-lime opacity-5 blur-3xl" />

      <div className="relative z-10 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="flex flex-col gap-32 py-32">
          <div className="container relative space-y-16">
            {/* Section header with icon */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-neon-lime/10">
                <span className="text-4xl">✨</span>
              </div>
              <h2 className="mb-6 text-4xl font-black lowercase leading-tight tracking-super-tight md:text-6xl">
                nómina y reclutamiento del futuro
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
                {APP_NAME} revoluciona la gestión de capital humano con dos sistemas poderosos:
                Nómina 100% mexicana y Reclutamiento inteligente sin features inútiles que nadie usa.
              </p>
              <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-neon-lime via-cool-cyan to-neon-lime" />
            </div>
            <div className="mx-auto xl:container xl:rounded-xl xl:bg-neutral-50 xl:p-6 dark:xl:bg-neutral-900">
              <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-12 gap-6">
                <BentoCustomersCard
                  className="col-span-12 md:col-span-6 xl:col-span-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                />
                <BentoPipelinesCard
                  className="col-span-12 md:col-span-6 xl:col-span-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <BentoAnalyticsCard
                  className="col-span-12 md:col-span-6 xl:col-span-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <BentoCampaignsCard
                  className="col-span-12 md:col-span-6 xl:col-span-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                />
                <BentoMagicInboxCard
                  className="col-span-12 md:col-span-6 xl:col-span-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                />
              </div>
            </div>
            {/* Visual divider */}
            <div className="relative py-12">
              <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-neon-lime to-cool-cyan" />
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <div className="grid gap-16 sm:container lg:grid-cols-2 lg:items-center">
              <div className="order-1 lg:order-2">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-lime/20 to-cool-cyan/20">
                  <span className="text-3xl">🎯</span>
                </div>
                <h2 className="mb-4 text-3xl font-black lowercase tracking-tight md:text-5xl">
                  tu sistema operativo de RH
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Sistema de reclutamiento del futuro: enfocado al usuario, sin features estúpidas.
                  Solo lo que realmente necesitas para contratar al mejor talento.
                </p>
                <ul className="mt-6 list-none flex-wrap items-center gap-6 space-y-3 md:flex md:space-y-0">
                  {[
                    'ATS minimalista y eficiente',
                    'Filtrado inteligente de candidatos',
                    'Entrevistas automatizadas',
                    'Portal de candidatos móvil',
                    'Integración con bolsas de trabajo',
                    'Métricas que realmente importan'
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex flex-row items-center gap-2"
                    >
                      <CircleCheckBigIcon className="size-4 shrink-0 text-primary" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-2 md:order-1">
                <AiAdvisorCard className="w-full max-w-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GridSection>
  );
}

import * as React from 'react';
import Link from 'next/link';

import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { BlurFade } from '~/components/fragments/blur-fade';
import { GridSection } from '~/components/fragments/grid-section';
import { TextGenerateEffect } from '~/components/fragments/text-generate-effect';

export function CTA(): React.JSX.Element {
  return (
    <GridSection className="relative overflow-hidden bg-primary">
      {/* Decorative organic shapes */}
      <div className="absolute left-10 top-10 size-64 animate-rotate-slow rounded-full bg-primary-dark opacity-30 blur-3xl" />
      <div className="absolute bottom-10 right-10 size-80 animate-float-large rounded-full bg-primary-darker opacity-40 blur-3xl" />
      <div className="absolute left-1/4 top-1/4 size-32 blob-shape animate-float bg-neon-lime opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 size-40 blob-shape-2 animate-pulse-scale bg-sunny-yellow opacity-20" />

      <div className="container relative z-10 flex flex-col items-center justify-between gap-8 py-24 text-center">
        <h3 className="m-0 max-w-2xl text-4xl font-black lowercase leading-tight tracking-super-tight text-primary-foreground md:text-5xl lg:text-6xl">
          <TextGenerateEffect words="¿listo para comenzar?" />
        </h3>
        <p className="max-w-xl text-lg text-primary-foreground/90">
          únete a las empresas que ya están transformando su gestión de nómina
        </p>
        <BlurFade
          inView
          delay={0.6}
        >
          <Link
            href={routes.dashboard.auth.SignUp}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-14 rounded-2xl bg-white px-10 text-lg font-bold lowercase tracking-tight text-primary shadow-2xl transition-all hover:scale-105 hover:shadow-neon-lime/50 hover:shadow-2xl'
            )}
          >
            empieza gratis ahora
            <span className="ml-2 animate-bounce text-neon-lime">→</span>
          </Link>
        </BlurFade>
      </div>
    </GridSection>
  );
}

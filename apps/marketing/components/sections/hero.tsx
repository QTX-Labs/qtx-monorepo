'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BoxIcon,
  ChevronRightIcon,
  CircuitBoardIcon,
  FileBarChartIcon,
  LayoutIcon,
  PlayIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import { routes } from '@workspace/routes';
import { Badge } from '@workspace/ui/components/badge';
import { buttonVariants } from '@workspace/ui/components/button';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import {
  UnderlinedTabs,
  UnderlinedTabsContent,
  UnderlinedTabsList,
  UnderlinedTabsTrigger
} from '@workspace/ui/components/tabs';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';

function HeroPill(): React.JSX.Element {
  return (
    <motion.div
      initial={{ filter: 'blur(10px)', opacity: 0, y: -20 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center gap-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge
          variant="secondary"
          className="h-7 rounded-full px-3 text-xs font-semibold shadow-sm"
        >
          <span className="text-orange-600">Y Combinator W23</span>
        </Badge>
        <Badge
          variant="secondary"
          className="h-7 rounded-full px-3 text-xs font-semibold shadow-sm"
        >
          🇲🇽 Hecho por Mexicanos
        </Badge>
        <Badge
          variant="secondary"
          className="h-7 rounded-full px-3 text-xs font-semibold shadow-sm"
        >
          📍 Silicon Valley
        </Badge>
      </div>
      <Link href="#">
        <Badge
          variant="outline"
          className="group h-8 rounded-full px-3 text-xs font-medium shadow-xs duration-200 hover:bg-accent/50 sm:text-sm"
        >
          <div className="w-fit py-0.5 text-center text-xs text-blue-500 sm:text-sm">
            New!
          </div>
          <Separator
            orientation="vertical"
            className="mx-2"
          />
          Respaldado por inversionistas de Silicon Valley
          <ChevronRightIcon className="ml-1.5 size-3 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5" />
        </Badge>
      </Link>
    </motion.div>
  );
}

function HeroTitle(): React.JSX.Element {
  return (
    <motion.div
      initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="relative"
    >
      {/* Decorative blob shapes */}
      <div className="absolute -left-20 -top-10 size-32 animate-float-large rounded-full bg-neon-lime opacity-20 blur-2xl" />
      <div className="absolute -right-16 top-0 size-24 animate-float rounded-full bg-sunny-yellow opacity-20 blur-2xl" />

      <h1 className="relative mt-6 text-center text-[48px] font-black lowercase leading-[54px] tracking-super-tight sm:text-[56px] md:text-[64px] lg:text-[76px] lg:leading-[74px]">
        <span className="text-primary">la nómina del futuro</span>
        <br />
        <span className="bg-gradient-to-r from-primary via-neon-lime to-primary bg-clip-text text-transparent">
          para México
        </span>
      </h1>
    </motion.div>
  );
}

function HeroDescription(): React.JSX.Element {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="mx-auto mt-3 max-w-[560px] text-balance text-center text-lg leading-[26px] text-muted-foreground sm:text-xl lg:mt-6"
    >
      Automatiza tu nómina, cumple con SAT e IMSS al 100%, y ahorra hasta 70% del tiempo en procesos de RH. Todo en una plataforma.
    </motion.p>
  );
}

function HeroButtons(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="mx-auto flex w-full flex-col gap-3 px-7 sm:w-auto sm:flex-row sm:px-0"
    >
      <Link
        href={routes.dashboard.auth.SignUp}
        className={cn(
          buttonVariants({
            variant: 'default'
          }),
          'group h-12 rounded-2xl bg-primary px-8 text-base font-bold lowercase tracking-tight shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:h-11'
        )}
      >
        <span className="relative">
          prueba gratis 30 días
          <span className="absolute -right-2 -top-1 flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon-lime opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-neon-lime"></span>
          </span>
        </span>
      </Link>
      <Link
        href={routes.marketing.Contact}
        className={cn(
          buttonVariants({
            variant: 'outline'
          }),
          'h-12 rounded-2xl border-2 border-primary px-8 text-base font-bold lowercase tracking-tight transition-all hover:scale-105 hover:bg-primary/10 sm:h-11'
        )}
      >
        solicitar demo
      </Link>
    </motion.div>
  );
}

function MainDashedGridLines(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <svg className="absolute left-[16.85%] top-0 hidden h-full w-px mask-[linear-gradient(to_bottom,#0000,#000_128px,#000_calc(100%-24px),#0000)] lg:block">
        <line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100%"
          strokeLinecap="round"
          strokeDasharray="5 5"
          stroke="var(--border)"
        />
      </svg>
      <svg className="absolute right-[16.85%] top-0 hidden h-full w-px mask-[linear-gradient(to_bottom,#0000,#000_128px,#000_calc(100%-24px),#0000)] lg:block">
        <line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100%"
          strokeLinecap="round"
          strokeDasharray="5 5"
          stroke="var(--border)"
        />
      </svg>
      <svg className="absolute bottom-[52px] left-[calc(50%-50vw)] hidden h-px w-screen mask-[linear-gradient(to_right,#0000,#000_100px,#000_calc(100%-100px),#0000)] lg:block">
        <line
          x1="0"
          y1="0.5"
          x2="100%"
          y2="0.5"
          strokeLinecap="round"
          strokeDasharray="5 5"
          stroke="var(--border)"
        />
      </svg>
    </motion.div>
  );
}

function SupportiveDashedGridLines(): React.JSX.Element {
  return (
    <>
      <svg className="absolute left-[calc(50%-50vw)] top-[-25px] z-10 hidden h-px w-screen mask-[linear-gradient(to_right,#0000,#000_100px,#000_calc(100%-100px),#0000)] lg:block">
        <line
          x1="0"
          y1="0.5"
          x2="100%"
          y2="0.5"
          strokeLinecap="round"
          strokeDasharray="5 5"
          stroke="var(--border)"
        />
      </svg>
      <svg className="absolute left-[calc(50%-50vw)] top-0 z-10 hidden h-px w-screen mask-[linear-gradient(to_right,#0000,#000_100px,#000_calc(100%-100px),#0000)] lg:block">
        <line
          x1="0"
          y1="0.5"
          x2="100%"
          y2="0.5"
          strokeLinecap="round"
          strokeDasharray="5 5"
          stroke="var(--border)"
        />
      </svg>
      <svg className="absolute left-[calc(50%-50vw)] top-[52px] z-10 hidden h-px w-screen mask-[linear-gradient(to_right,#0000,#000_100px,#000_calc(100%-100px),#0000)] lg:block">
        <line
          x1="0"
          y1="0.5"
          x2="100%"
          y2="0.5"
          strokeLinecap="round"
          strokeDasharray="5 5"
          stroke="var(--border)"
        />
      </svg>
    </>
  );
}

function HeroIllustration(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="relative mt-3 lg:mt-6"
    >
      <UnderlinedTabs defaultValue="feature1">
        <ScrollArea className="w-full">
          <UnderlinedTabsList className="relative z-20 mb-6 flex h-fit flex-row flex-wrap justify-center gap-2 md:flex-nowrap md:gap-0">
            <UnderlinedTabsTrigger
              value="feature1"
              className="mx-1 px-2.5 sm:mx-2 sm:px-3"
            >
              <BoxIcon className="mr-2 size-4 shrink-0" />
              Cálculo de Nómina
            </UnderlinedTabsTrigger>
            <UnderlinedTabsTrigger
              value="feature2"
              className="mx-1 px-2.5 sm:mx-2 sm:px-3"
            >
              <PlayIcon className="mr-2 size-4 shrink-0" />
              Timbrado CFDI 4.0
            </UnderlinedTabsTrigger>
            <UnderlinedTabsTrigger
              value="feature3"
              className="mx-1 px-2.5 sm:mx-2 sm:px-3"
            >
              <CircuitBoardIcon className="mr-2 size-4 shrink-0" />
              IMSS e IDSE
            </UnderlinedTabsTrigger>
            <UnderlinedTabsTrigger
              value="feature4"
              className="mx-1 px-2.5 sm:mx-2 sm:px-3"
            >
              <LayoutIcon className="mr-2 size-4 shrink-0" />
              Portal del Empleado
            </UnderlinedTabsTrigger>
            <UnderlinedTabsTrigger
              value="feature5"
              className="mx-1 px-2.5 sm:mx-2 sm:px-3"
            >
              <FileBarChartIcon className="mr-2 size-4 shrink-0" />
              Reportes y Analytics
            </UnderlinedTabsTrigger>
          </UnderlinedTabsList>
          <ScrollBar
            orientation="horizontal"
            className="invisible"
          />
        </ScrollArea>
        <div className="relative mb-1 w-full rounded-xl dark:border-none dark:bg-background">
          <SupportiveDashedGridLines />
          <div className="relative z-20 bg-background">
            <UnderlinedTabsContent value="feature1">
              <Image
                priority
                quality={100}
                src="/assets/hero/light-feature1.webp"
                width="1328"
                height="727"
                alt="Feature 1 screenshot"
                className="block rounded-xl border shadow dark:hidden"
              />
              <Image
                priority
                quality={100}
                src="/assets/hero/dark-feature1.webp"
                width="1328"
                height="727"
                alt="Feature 1 screenshot"
                className="hidden rounded-xl border shadow dark:block"
              />
            </UnderlinedTabsContent>
            <UnderlinedTabsContent value="feature2">
              <Image
                quality={100}
                src="/assets/hero/light-feature2.webp"
                width="1328"
                height="727"
                alt="Feature 2 screenshot"
                className="block rounded-xl border shadow dark:hidden"
              />
              <Image
                quality={100}
                src="/assets/hero/dark-feature2.webp"
                width="1328"
                height="727"
                alt="Feature 2 screenshot"
                className="hidden rounded-xl border shadow dark:block"
              />
            </UnderlinedTabsContent>
            <UnderlinedTabsContent value="feature3">
              <Image
                quality={100}
                src="/assets/hero/light-feature3.webp"
                width="1328"
                height="727"
                alt="Feature 3 screenshot"
                className="block rounded-xl border shadow dark:hidden"
              />
              <Image
                quality={100}
                src="/assets/hero/dark-feature3.webp"
                width="1328"
                height="727"
                alt="Feature 3 screenshot"
                className="hidden rounded-xl border shadow dark:block"
              />
            </UnderlinedTabsContent>
            <UnderlinedTabsContent value="feature4">
              <Image
                quality={100}
                src="/assets/hero/light-feature4.webp"
                width="1328"
                height="727"
                alt="Feature 4 screenshot"
                className="block rounded-xl border shadow dark:hidden"
              />
              <Image
                quality={100}
                src="/assets/hero/dark-feature4.webp"
                width="1328"
                height="727"
                alt="Feature 4 screenshot"
                className="hidden rounded-xl border shadow dark:block"
              />
            </UnderlinedTabsContent>
            <UnderlinedTabsContent value="feature5">
              <Image
                quality={100}
                src="/assets/hero/light-feature5.webp"
                width="1328"
                height="727"
                alt="Feature 5 screenshot"
                className="block rounded-xl border shadow dark:hidden"
              />
              <Image
                quality={100}
                src="/assets/hero/dark-feature5.webp"
                width="1328"
                height="727"
                alt="Feature 5 screenshot"
                className="hidden rounded-xl border shadow dark:block"
              />
            </UnderlinedTabsContent>
          </div>
        </div>
      </UnderlinedTabs>
    </motion.div>
  );
}

export function Hero(): React.JSX.Element {
  return (
    <GridSection className="overflow-x-hidden">
      <MainDashedGridLines />
      <div className="mx-auto mt-16 flex flex-col gap-6 px-2 sm:mt-20 sm:px-1 md:mt-24 lg:mt-32">
        <div className="gap-2">
          <HeroPill />
          <HeroTitle />
        </div>
        <HeroDescription />
        <HeroButtons />
        <HeroIllustration />
      </div>
    </GridSection>
  );
}

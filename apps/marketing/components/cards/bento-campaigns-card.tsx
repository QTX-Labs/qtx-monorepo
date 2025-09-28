'use client';

import * as React from 'react';
import { MailIcon, MessageSquareIcon } from 'lucide-react';
import { motion } from 'motion/react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import {
  Autoplay,
  Carousel,
  CarouselContent,
  CarouselItem
} from '@workspace/ui/components/carousel';
import { cn } from '@workspace/ui/lib/utils';

const DATA = [
  {
    type: 'email',
    icon: MailIcon,
    title: 'Evaluación Inicial',
    timing: 'Al contratar nuevo empleado'
  },
  {
    type: 'message',
    icon: MessageSquareIcon,
    title: 'Encuesta de Clima',
    timing: 'Evaluación trimestral'
  },
  {
    type: 'email',
    icon: MailIcon,
    title: 'Riesgos Psicosociales',
    timing: 'Análisis mensual'
  },
  {
    type: 'message',
    icon: MessageSquareIcon,
    title: 'Plan de Acción',
    timing: 'Post-evaluación'
  },
  {
    type: 'email',
    icon: MailIcon,
    title: 'Capacitación NOM-035',
    timing: 'Anual obligatorio'
  },
  {
    type: 'message',
    icon: MessageSquareIcon,
    title: 'Seguimiento Casos',
    timing: 'Alertas automáticas'
  },
  {
    type: 'email',
    icon: MailIcon,
    title: 'Reporte STPS',
    timing: 'Generación automática'
  },
  {
    type: 'message',
    icon: MessageSquareIcon,
    title: 'Auditoría Compliance',
    timing: 'Verificación continua'
  }
];

const MotionCard = motion.create(Card);

export function BentoCampaignsCard({
  className,
  ...other
}: React.ComponentPropsWithoutRef<typeof MotionCard>): React.JSX.Element {
  return (
    <MotionCard
      className={cn(
        'relative h-[300px] max-h-[300px] overflow-hidden',
        className
      )}
      {...other}
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold">NOM-035 Compliance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          Cumple con la NOM-035-STPS. Evaluación de riesgos psicosociales automatizada.
        </p>
        <Carousel
          opts={{
            align: 'start',
            skipSnaps: true,
            loop: true,
            dragFree: true
          }}
          plugins={[
            Autoplay({
              delay: 2000
            })
          ]}
          orientation="vertical"
          className="pointer-events-none size-full select-none"
        >
          <CarouselContent className="pointer-events-none -mt-1 h-[232px] select-none sm:h-[146px]">
            {DATA.map(({ title, timing, icon: Icon }, index) => (
              <CarouselItem
                key={index}
                className="pointer-events-none basis-1/4 select-none pt-1 will-change-transform"
              >
                <Card className="m-1 p-0">
                  <CardContent className="flex w-full flex-row items-center justify-start gap-4 p-6">
                    <div className="rounded-full bg-primary p-2 text-primary-foreground">
                      <Icon className="size-5 shrink-0" />
                    </div>
                    <div>
                      <div className="text-xs font-medium sm:text-sm">
                        {title}
                      </div>
                      <div className="text-[10px] text-muted-foreground sm:text-xs">
                        {timing}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </MotionCard>
  );
}

import * as React from 'react';
import Link from 'next/link';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';

import { GridSection } from '~/components/fragments/grid-section';

const DATA = [
  {
    question: `¿Qué hace ${APP_NAME}?`,
    answer: `${APP_NAME} es la plataforma integral de gestión de capital humano para México. Combina nómina 100% compatible con SAT/IMSS y un sistema de reclutamiento revolucionario sin features inútiles. Procesa nómina en minutos, no días.`
  },
  {
    question: '¿Cómo beneficia a mi empresa?',
    answer: `Ahorra hasta 80% del tiempo en procesar nómina y reduce errores en cálculos fiscales a cero. Nuestro ATS minimalista te ayuda a contratar 3x más rápido, enfocándose solo en lo que realmente importa para encontrar talento.`
  },
  {
    question: '¿Es seguro para datos sensibles de nómina?',
    answer:
      'Cumplimos con la NOM-151 y todos los estándares de protección de datos personales en México. Encriptación de grado bancario, respaldos automáticos y auditoría completa de accesos.'
  },
  {
    question: '¿Qué integraciones tienen disponibles?',
    answer: `${APP_NAME} se integra con bancos mexicanos (BBVA, Santander, Banamex), sistemas contables (CONTPAQi, Aspel), bolsas de trabajo (OCC, Indeed México) y herramientas de RH.`
  },
  {
    question: '¿Qué tan fácil es migrar desde otro sistema?',
    answer:
      'Migración GRATIS en 48 horas. Nuestro equipo importa todo: empleados, históricos, configuraciones fiscales. Sin pérdida de datos, sin interrumpir tu operación.'
  },
  {
    question: '¿Para qué tipos de empresas es ideal?',
    answer: `Desde microempresas hasta corporativos. PyMEs mexicanas, maquiladoras, startups, despachos contables. Si tienes empleados en México, ${APP_NAME} es para ti.`
  },
  {
    question: '¿El sistema de reclutamiento es personalizable?',
    answer:
      'Totalmente. Nuestro ATS se adapta a tu proceso, no al revés. Sin features complicadas que nadie usa, solo herramientas prácticas para contratar más rápido y mejor.'
  }
];

export function FAQ(): React.JSX.Element {
  return (
    <GridSection className="relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute right-10 top-20 size-96 animate-float-large rounded-full bg-sunny-yellow opacity-5 blur-3xl" />

      <div className="container relative z-10 py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-sunny-yellow/10 lg:mx-0">
              <span className="text-4xl">❓</span>
            </div>
            <h2 className="mb-6 text-4xl font-black lowercase tracking-super-tight md:text-5xl">
              preguntas frecuentes
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-sunny-yellow via-warm-orange to-sunny-yellow lg:mx-0" />
            <p className="mt-8 hidden text-muted-foreground md:block lg:max-w-[85%]">
              ¿No encontraste lo que buscabas?{' '}
              <Link
                href={routes.marketing.Contact}
                className="font-semibold text-primary underline hover:text-primary/80"
              >
                Contáctanos
              </Link>
              , estamos para ayudarte.
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-xl flex-col">
            <Accordion
              type="single"
              collapsible
            >
              {DATA.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={index.toString()}
                >
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </GridSection>
  );
}

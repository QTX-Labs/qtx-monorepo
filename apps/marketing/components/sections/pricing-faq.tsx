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
    question: `¿Qué planes de precios ofrece ${APP_NAME}?`,
    answer: (
      <div>
        Ofrecemos tres planes diseñados para empresas mexicanas:
        <br />
        <ul className="mt-2 list-disc pl-5">
          <li>
            <strong>Starter:</strong> Gratis hasta 5 empleados - perfecto para microempresas
          </li>
          <li>
            <strong>Crecimiento:</strong> $99 MXN por empleado/mes - ideal para PyMEs
          </li>
          <li>
            <strong>Empresarial:</strong> Precio especial por volumen - para grandes corporativos
          </li>
        </ul>
        <p className="mt-2">Todos incluyen cumplimiento SAT, IMSS e IDSE garantizado.</p>
      </div>
    )
  },
  {
    question: "¿Qué incluye el plan Starter gratuito?",
    answer: (
      <div>
        El plan Starter es perfecto para comenzar e incluye:
        <ul className="mt-2 list-disc pl-5">
          <li>Hasta 5 empleados sin costo</li>
          <li>Cálculo automático de ISR, IMSS, aguinaldo y PTU</li>
          <li>Timbrado CFDI 4.0 ilimitado</li>
          <li>Portal del empleado básico</li>
          <li>Soporte por email</li>
        </ul>
      </div>
    )
  },
  {
    question: '¿Qué ventajas tiene el plan Crecimiento?',
    answer: (
      <div>
        El plan Crecimiento es ideal para PyMEs e incluye:
        <ul className="mt-2 list-disc pl-5">
          <li>Empleados ilimitados a $99 MXN c/u por mes</li>
          <li>Dispersión de nómina automática</li>
          <li>Integración con bancos mexicanos</li>
          <li>Reportes avanzados y analytics</li>
          <li>Soporte prioritario por WhatsApp</li>
          <li>Actualizaciones automáticas de tablas ISR/IMSS</li>
        </ul>
      </div>
    )
  },
  {
    question: '¿Qué ofrece el plan Empresarial?',
    answer: (
      <div>
        El plan Empresarial es totalmente personalizable:
        <ul className="mt-2 list-disc pl-5">
          <li>Precio especial por volumen (desde $49 MXN por empleado)</li>
          <li>Multi-empresa y multi-sucursal</li>
          <li>API para integración con sistemas propios</li>
          <li>Gerente de cuenta dedicado</li>
          <li>Capacitación y onboarding personalizado</li>
          <li>SLA garantizado de 99.9% uptime</li>
        </ul>
        <p className="mt-2">Contáctanos para una cotización personalizada.</p>
      </div>
    )
  },
  {
    question: '¿Cómo funciona la migración desde otro sistema?',
    answer: (
      <p>
        Ofrecemos migración GRATUITA desde cualquier sistema de nómina.
        Nuestro equipo te ayuda a importar empleados, históricos y configuraciones.
        El proceso toma típicamente 24-48 horas y garantizamos cero pérdida de datos.
      </p>
    )
  },
  {
    question: '¿Están actualizados con los cambios del SAT e IMSS?',
    answer: (
      <p>
        Sí, {APP_NAME} se actualiza automáticamente con cada cambio regulatorio.
        Nuestro equipo legal monitorea diariamente el DOF y actualiza las tablas
        de ISR, UMA, salarios mínimos e IMSS sin que tengas que hacer nada.
      </p>
    )
  },
  {
    question: '¿Qué pasa si tengo una auditoría del SAT o IMSS?',
    answer: (
      <p>
        Con {APP_NAME} tienes respaldo completo. Generamos automáticamente todos
        los reportes necesarios para auditorías. Además, si recibes una multa por
        error de nuestro sistema, nosotros la pagamos (aplican términos y condiciones).
      </p>
    )
  }
];

export function PricingFAQ(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-left">
            <h2 className="mb-2.5 text-3xl font-semibold md:text-5xl">
              Preguntas Frecuentes
            </h2>
            <p className="mt-6 hidden text-muted-foreground md:block lg:max-w-[75%]">
              ¿Tienes dudas sobre nuestros planes o precios?{' '}
              <Link
                href={routes.marketing.Contact}
                className="font-normal text-inherit underline hover:text-foreground"
              >
                Contáctanos
              </Link>{' '}
              - estamos aquí para ayudarte a encontrar el plan perfecto para tu empresa.
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

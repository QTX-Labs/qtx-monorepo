import * as React from 'react';
import { BookIcon, CookieIcon, ScaleIcon } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

const DATA_CARDS = [
  {
    title: '¿Qué son las Cookies?',
    icon: <CookieIcon className="size-4 shrink-0" />,
    content:
      'Las cookies son pequeños archivos de texto almacenados en tu dispositivo que nos ayudan a mejorar tu experiencia recordando preferencias.'
  },
  {
    title: 'Tipos de Cookies',
    icon: <BookIcon className="size-4 shrink-0" />,
    content:
      'Utilizamos cookies de sesión y persistentes para rastrear la actividad del usuario y mejorar la funcionalidad del sitio.'
  },
  {
    title: 'Gestión de Cookies',
    icon: <ScaleIcon className="size-4 shrink-0" />,
    content:
      'Puedes controlar la configuración de cookies en tu navegador. Sin embargo, deshabilitar las cookies puede afectar tu experiencia en nuestro sitio.'
  }
];

const DATA_ACCORDION = [
  {
    title: 'Cookies que Utilizamos',
    content:
      'Utilizamos cookies para funcionalidad (ej. sesiones), rendimiento (ej. analíticas), y publicidad (ej. anuncios dirigidos).'
  },
  {
    title: 'Cookies de Terceros',
    content:
      'Podemos permitir que servicios de terceros (como Google Analytics) coloquen cookies en tu dispositivo para propósitos específicos.'
  },
  {
    title: 'Cómo Gestionar Cookies',
    content:
      'Puedes ajustar la configuración de cookies en tu navegador. Para instrucciones más detalladas, consulta la guía de ayuda de tu navegador.'
  },
  {
    title: 'Cambios a Nuestra Política de Cookies',
    content:
      'Podemos actualizar esta Política de Cookies de vez en cuando. Cualquier cambio será publicado en esta página.'
  }
];

export function CookiePolicy(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <SiteHeading
          badge="Legal"
          title="Política de Cookies"
          description="Aprende cómo utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma."
        />
        <Alert variant="warning">
          <AlertDescription className="ml-3 text-base inline">
            Esta política proporciona un marco general. Debe ser revisada y
            personalizada por un profesional legal para ajustarse a tu jurisdicción y caso de uso.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DATA_CARDS.map((item, index) => (
            <Card
              key={index}
              className="border-none dark:bg-accent/40"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {item.icon}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Accordion
          type="single"
          collapsible
        >
          {DATA_ACCORDION.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="flex items-center justify-between text-lg font-medium">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div>
          <CardTitle className="text-lg text-primary">
            Información de Contacto
          </CardTitle>
          <p className="text-sm leading-relaxed">
            Para preguntas o inquietudes, contáctanos en:
            <br />
            <a
              href="mailto:hola@qtx.mx"
              className="text-blue-500 hover:underline"
            >
              hola@qtx.mx
            </a>
          </p>
        </div>
      </div>
    </GridSection>
  );
}

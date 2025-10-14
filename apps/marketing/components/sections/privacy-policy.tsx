import * as React from 'react';
import { AlertCircleIcon, BookIcon, ScaleIcon } from 'lucide-react';

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
    title: 'Introducción',
    icon: <BookIcon className="size-4 shrink-0" />,
    content:
      'Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tus datos personales cuando interactúas con nuestra plataforma.'
  },
  {
    title: 'Recopilación de Información',
    icon: <ScaleIcon className="size-4 shrink-0" />,
    content:
      'Recopilamos información que nos proporcionas directamente, como cuando te registras o interactúas con nuestros servicios.'
  },
  {
    title: 'Uso de Datos',
    icon: <AlertCircleIcon className="size-4 shrink-0" />,
    content:
      'Usamos tus datos para proporcionar, personalizar y mejorar tu experiencia en nuestra plataforma, incluyendo marketing y soporte.'
  }
];

const DATA_ACCORDION = [
  {
    title: 'Cómo Protegemos Tus Datos',
    content:
      'Implementamos varias medidas de seguridad, incluyendo encriptación y almacenamiento seguro, para proteger tu información personal.'
  },
  {
    title: 'Compartir con Terceros',
    content:
      'Podemos compartir tus datos con proveedores de servicios terceros confiables para operaciones esenciales como procesamiento de pagos o analíticas.'
  },
  {
    title: 'Derechos del Usuario',
    content:
      'Tienes derecho a acceder, actualizar o eliminar tus datos personales en cualquier momento. También puedes optar por no recibir comunicaciones de marketing.'
  },
  {
    title: 'Cookies y Seguimiento',
    content:
      'Usamos cookies y tecnologías similares para personalizar tu experiencia y analizar patrones de uso en nuestro sitio.'
  },
  {
    title: 'Cambios a Esta Política',
    content:
      'Podemos actualizar esta Política de Privacidad de vez en cuando. Los cambios se publicarán aquí, y el uso continuado de la plataforma constituye aceptación.'
  }
];}]

export function PrivacyPolicy(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <SiteHeading
          badge="Legal"
          title="Política de Privacidad"
          description="Aprende cómo recopilamos, usamos y protegemos tus datos. Por favor lee cuidadosamente para entender nuestras prácticas."
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

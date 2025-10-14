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
      'Estos términos describen las reglas para usar nuestra plataforma. Al continuar usando la plataforma, aceptas cumplir con ellos.'
  },
  {
    title: 'Elegibilidad',
    icon: <ScaleIcon className="size-4 shrink-0" />,
    content:
      'Los usuarios deben tener al menos 18 años y proporcionar detalles precisos para mantener sus cuentas.'
  },
  {
    title: 'Usos Prohibidos',
    icon: <AlertCircleIcon className="size-4 shrink-0" />,
    content:
      'Los usuarios deben evitar publicar contenido dañino, distribuir malware, o intentar acceso no autorizado a la plataforma.'
  }
];

const DATA_ACCORDION = [
  {
    title: 'Derechos de Propiedad Intelectual',
    content:
      'Todo el contenido de la plataforma, incluyendo marcas registradas y materiales, es de nuestra propiedad. El uso no autorizado está prohibido.'
  },
  {
    title: 'Contenido Generado por Usuarios',
    content:
      'Mantienes la propiedad del contenido que publicas pero nos otorgas una licencia para usarlo. El contenido inapropiado puede ser eliminado a nuestra discreción.'
  },
  {
    title: 'Limitación de Responsabilidad',
    content:
      "Nuestra plataforma se proporciona 'tal como está' sin garantías. No somos responsables por daños indirectos, y los usuarios asumen los riesgos asociados."
  },
  {
    title: 'Terminación de Acceso',
    content:
      'Podemos suspender o terminar el acceso por violaciones de estos términos, actividad fraudulenta, u otras razones válidas.'
  },
  {
    title: 'Ley Aplicable y Disputas',
    content:
      'Estos términos se rigen por las leyes de México. Las disputas se resolverán a través de arbitraje o tribunales designados.'
  },
  {
    title: 'Modificaciones a los Términos',
    content:
      'Nos reservamos el derecho de actualizar estos términos. Los cambios se publicarán aquí, y el uso continuado constituye aceptación.'
  }
];

export function TermsOfUse(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <SiteHeading
          badge="Legal"
          title="Términos de Uso"
          description="Al acceder a nuestra plataforma, aceptas los términos descritos a continuación. Por favor léelos cuidadosamente para asegurar que entiendes tus derechos y responsabilidades."
        />
        <Alert variant="warning">
          <AlertDescription className="ml-3 text-base inline">
            Estos términos proporcionan un marco general. Deben ser revisados y
            personalizados por un profesional legal para ajustarse a tu jurisdicción y caso de uso.
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

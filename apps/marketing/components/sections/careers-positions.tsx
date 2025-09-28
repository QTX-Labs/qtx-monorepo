import * as React from 'react';
import { ClockIcon, MapPinIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';

import { GridSection } from '~/components/fragments/grid-section';

const DATA = [
  {
    title: 'AI Architect - Payroll Automation',
    department: 'AI Engineering',
    description:
      'Diseña la arquitectura de agentes IA que automatizarán el 90% de procesos de nómina. Experiencia en LLMs, RAG y sistemas multi-agente requerida.',
    type: 'Full-time',
    location: 'San Francisco, CA'
  },
  {
    title: 'Head of AI Operations',
    department: 'AI Strategy',
    description:
      'Lidera la transformación hacia empresa AI-first. Define estrategia para reemplazar procesos manuales con agentes autónomos.',
    type: 'Full-time',
    location: 'San Francisco, CA'
  },
  {
    title: 'ML Engineer - Compliance Automation',
    department: 'AI Engineering',
    description:
      'Desarrolla modelos que detecten y corrijan automáticamente errores de compliance SAT/IMSS antes de generar multas.',
    type: 'Full-time',
    location: 'Ciudad de México'
  },
  {
    title: 'AI Product Manager - Agent Systems',
    department: 'Product',
    description:
      'Define roadmap de agentes IA que reemplazarán tareas repetitivas. Experiencia en productos B2B SaaS y sistemas autónomos.',
    type: 'Full-time',
    location: 'San Francisco, CA'
  },
  {
    title: 'Prompt Engineer - Mexican Payroll Expert',
    department: 'AI Engineering',
    description:
      'Optimiza prompts y entrena agentes especializados en legislación mexicana. Conocimiento profundo de NOM, ISR, IMSS requerido.',
    type: 'Full-time',
    location: 'Ciudad de México'
  },
  {
    title: 'AI Customer Success Lead',
    department: 'Customer Success',
    description:
      'Diseña sistemas de soporte 100% automatizados con IA. El objetivo: resolver 95% de tickets sin intervención humana.',
    type: 'Full-time',
    location: 'Ciudad de México'
  },
  {
    title: 'Senior AI Engineer - Document Intelligence',
    department: 'AI Engineering',
    description:
      'Construye sistemas que lean, entiendan y procesen documentos fiscales mexicanos automáticamente. Computer Vision + NLP.',
    type: 'Full-time',
    location: 'San Francisco, CA'
  },
  {
    title: 'Director of AI Talent',
    department: 'People & AI',
    description:
      'Recluta y desarrolla el mejor equipo de IA en LATAM. Define cultura y procesos para empresa conducida por IA.',
    type: 'Full-time',
    location: 'Ciudad de México'
  },
  {
    title: 'AI Infrastructure Engineer',
    department: 'Platform',
    description:
      'Escala infraestructura para soportar millones de inferencias diarias. Experiencia en GPU clusters, vector DBs y LLM serving.',
    type: 'Full-time',
    location: 'San Francisco, CA'
  },
  {
    title: 'AI Ethics & Compliance Officer',
    department: 'Legal & AI',
    description:
      'Garantiza que nuestros agentes IA cumplan con regulaciones mexicanas y estándares éticos. Define governance de IA.',
    type: 'Full-time',
    location: 'Ciudad de México'
  }
];

export function CareersPositions(): React.JSX.Element {
  return (
    <GridSection>
      <div className="space-y-12 py-20">
        <h2 className="text-center text-3xl font-semibold md:text-4xl">
          Únete a la Primera Empresa de Nómina Conducida por IA
        </h2>
        <p className="text-center text-lg text-muted-foreground">
          Buscamos talento excepcional para construir el futuro donde la IA maneja el 95% de las operaciones
        </p>
        <div className="container mx-auto grid max-w-4xl grid-cols-1 gap-2 divide-y">
          {DATA.map((position, index) => (
            <div
              key={index}
              className="flex flex-col justify-between border-dashed py-6 md:flex-row  md:items-center"
            >
              <div className="flex-1">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                  <h3 className="mb-1 text-lg font-semibold">
                    {position.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="w-fit rounded-full"
                  >
                    {position.department}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{position.description}</p>
                <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-auto w-4" />
                    {position.type}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-auto w-4" />
                    {position.location}
                  </div>
                </div>
              </div>
              <div className="mt-4 shrink-0 md:mt-0">
                <Button
                  type="button"
                  variant="default"
                  className="rounded-xl"
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}

import * as React from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@workspace/ui/components/avatar';

import { GridSection } from '~/components/fragments/grid-section';

const DATA = [
  {
    name: 'Carlos Mendoza',
    role: 'CEO & Co-Founder',
    image: '',
    previousRole: 'Ex-Director de Producto en CONTPAQi',
    education: 'MBA Stanford GSB, Ing. Sistemas ITAM'
  },
  {
    name: 'Ana Lucía Ramírez',
    role: 'CTO & Co-Founder',
    image: '',
    previousRole: 'Ex-Tech Lead en LinkedIn (Silicon Valley)',
    education: 'MS Computer Science UC Berkeley'
  },
  {
    name: 'Roberto Jiménez',
    role: 'VP of Product',
    image: '',
    previousRole: 'Ex-Head of Product en ComputTrabajo',
    education: 'Ingeniería en Software, Tec de Monterrey'
  },
  {
    name: 'María Fernanda Torres',
    role: 'VP of Engineering',
    image: '',
    previousRole: 'Ex-Sr. Engineering Manager en Stripe',
    education: 'PhD Computer Science MIT'
  },
  {
    name: 'Diego Hernández',
    role: 'Head of AI/ML',
    image: '',
    previousRole: 'Ex-ML Engineer en OpenAI',
    education: 'PhD Machine Learning Stanford'
  },
  {
    name: 'Sofía Gutiérrez',
    role: 'Head of Design',
    image: '',
    previousRole: 'Ex-Principal Designer en Airbnb',
    education: 'MFA Design, Rhode Island School of Design'
  },
  {
    name: 'Alejandro Vargas',
    role: 'VP of Sales',
    image: '',
    previousRole: 'Ex-Enterprise Sales Director en CONTPAQi',
    education: 'MBA INSEAD, Lic. Administración UNAM'
  },
  {
    name: 'Patricia López',
    role: 'Head of Compliance',
    image: '',
    previousRole: 'Ex-Directora Legal y Fiscal en Deloitte México',
    education: 'Maestría en Derecho Fiscal, UNAM'
  }
];

export function StoryTeam(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container max-w-6xl py-20">
        <h2 className="mb-16 text-sm font-medium uppercase tracking-wider text-muted-foreground ">
          Los Visionarios
        </h2>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DATA.map((person, index) => (
            <div
              key={index}
              className="space-y-8"
            >
              <Avatar className="size-24 border-4 border-neutral-200 dark:border-neutral-800">
                <AvatarImage
                  src={person.image}
                  alt={person.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl">
                  {person.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{person.name}</h3>
                  <p className="text-primary">{person.role}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{person.previousRole}</p>
                  <p>{person.education}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}

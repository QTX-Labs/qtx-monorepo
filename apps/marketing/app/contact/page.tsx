import * as React from 'react';
import type { Metadata } from 'next';

import { Contact } from '~/components/sections/contact';
import { FAQ } from '~/components/sections/faq';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Contacto'),
  description: 'Cont\u00e1ctanos para transformar tu gesti\u00f3n de n\u00f3mina y recursos humanos. Solicita una demo de Quantix hoy.',
  keywords: ['contacto Quantix', 'demo software n\u00f3mina', 'soporte n\u00f3mina M\u00e9xico']
};

export default function ContactPage(): React.JSX.Element {
  return (
    <>
      <Contact />
      <FAQ />
    </>
  );
}

import * as React from 'react';
import { type Metadata } from 'next';
import Link from 'next/link';

import { routes } from '@workspace/routes';

import { SignUpCard } from '~/components/auth/sign-up/sign-up-card';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Registrarse')
};

export default function SignUpPage(): React.JSX.Element {
  return (
    <>
      <SignUpCard />
      <div className="px-2 text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros{' '}
        <Link
          prefetch={false}
          href={routes.marketing.TermsOfUse}
          className="text-foreground underline"
        >
          Términos de Uso
        </Link>{' '}
        y{' '}
        <Link
          prefetch={false}
          href={routes.marketing.PrivacyPolicy}
          className="text-foreground underline"
        >
          Política de Privacidad
        </Link>
        . ¿Necesitas ayuda?{' '}
        <Link
          prefetch={false}
          href={routes.marketing.Contact}
          className="text-foreground underline"
        >
          Contáctanos
        </Link>
        .
      </div>
    </>
  );
}

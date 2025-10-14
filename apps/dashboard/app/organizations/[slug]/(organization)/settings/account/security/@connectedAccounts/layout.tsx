import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

import { PasswordLoginHint } from '~/components/organizations/slug/settings/account/security/password-login-hint';

export default function ConnectedAccountsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <>
      <AnnotatedSection
        title="Cuentas conectadas"
        description="Inicia sesión más rápido en tu cuenta vinculándola a Google o Microsoft."
      >
        {children}
      </AnnotatedSection>
      <PasswordLoginHint />
    </>
  );
}

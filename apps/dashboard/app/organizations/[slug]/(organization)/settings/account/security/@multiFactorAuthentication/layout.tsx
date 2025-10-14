import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function MultiFactorAuthenticationLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Autenticación multifactor"
      description="Agrega una capa adicional de seguridad a tu inicio de sesión requiriendo un factor adicional."
    >
      {children}
    </AnnotatedSection>
  );
}

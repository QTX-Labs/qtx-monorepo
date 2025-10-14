import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function ChangePasswordLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Cambiar contraseña"
      description="Para realizar una actualización, ingresa tu contraseña actual seguida de una nueva. Si no conoces tu contraseña actual, cierra sesión y usa el enlace de olvidé mi contraseña."
    >
      {children}
    </AnnotatedSection>
  );
}

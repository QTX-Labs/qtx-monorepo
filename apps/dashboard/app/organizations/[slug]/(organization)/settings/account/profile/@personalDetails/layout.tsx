import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function PersonalDetailsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Detalles personales"
      description="Configura tu nombre e información de contacto, la dirección de correo ingresada aquí se usa para tu acceso de inicio de sesión."
    >
      {children}
    </AnnotatedSection>
  );
}

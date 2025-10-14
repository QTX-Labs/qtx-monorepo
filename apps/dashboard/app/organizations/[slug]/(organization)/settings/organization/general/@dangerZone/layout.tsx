import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function DangerZoneLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Zona de peligro"
      description="Ten cuidado, la eliminación no se puede deshacer. Solo el propietario puede eliminar una organización."
    >
      {children}
    </AnnotatedSection>
  );
}

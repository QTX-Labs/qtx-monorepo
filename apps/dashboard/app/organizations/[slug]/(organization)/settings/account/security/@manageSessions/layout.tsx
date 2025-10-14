import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function ManageSessionsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Administrar sesiones"
      description="Cierra tus sesiones activas en otros navegadores y dispositivos."
    >
      {children}
    </AnnotatedSection>
  );
}

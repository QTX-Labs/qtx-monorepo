import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function TeamLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Equipo"
      description="Administra e invita a tus colegas."
    >
      {children}
    </AnnotatedSection>
  );
}

import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function OrganizationLogoLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Logo"
      description="Actualiza el logo de tu organización para que sea más fácil de identificar."
    >
      {children}
    </AnnotatedSection>
  );
}

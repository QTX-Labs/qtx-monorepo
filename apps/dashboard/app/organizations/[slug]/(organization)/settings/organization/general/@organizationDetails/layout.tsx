import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function OrganizationDetailsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Detalles"
      description="Detalles básicos sobre tu organización."
    >
      {children}
    </AnnotatedSection>
  );
}

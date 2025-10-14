import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function OrganizationSlugLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="URL"
      description="Actualiza el slug de tu organización para obtener una nueva URL. Serás redirigido a la nueva URL."
    >
      {children}
    </AnnotatedSection>
  );
}

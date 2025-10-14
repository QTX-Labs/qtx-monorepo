import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function BillingEmailLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Destinatario de email"
      description="Toda la correspondencia de facturación se enviará a este correo."
    >
      {children}
    </AnnotatedSection>
  );
}

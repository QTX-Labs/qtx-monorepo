import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function InvoicesLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Facturas"
      description="Las facturas se envían automáticamente a tu email de facturación."
    >
      {children}
    </AnnotatedSection>
  );
}

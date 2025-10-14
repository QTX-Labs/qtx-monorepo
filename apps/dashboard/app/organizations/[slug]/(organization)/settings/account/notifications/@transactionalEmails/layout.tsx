import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function TransactionalEmailsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Correos transaccionales"
      description="Recibe correos sobre actividades del equipo y la cuenta."
    >
      {children}
    </AnnotatedSection>
  );
}

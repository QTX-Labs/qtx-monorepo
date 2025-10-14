import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function PlanLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Plan"
      description="Consulta, actualiza o cancela tu plan. La facturación es administrada por nuestro socio de pagos."
    >
      {children}
    </AnnotatedSection>
  );
}

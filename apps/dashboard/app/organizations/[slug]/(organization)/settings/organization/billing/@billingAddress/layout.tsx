import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function BillingAddressLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Dirección de facturación"
      description="Esto se reflejará en cada factura futura, las facturas pasadas no se verán afectadas."
    >
      {children}
    </AnnotatedSection>
  );
}

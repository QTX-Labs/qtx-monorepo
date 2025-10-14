import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function MarketingEmailsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Correos de marketing"
      description="Recibe correos sobre nuevos productos, funciones y más."
    >
      {children}
    </AnnotatedSection>
  );
}

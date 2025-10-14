import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function PreferencesLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Preferencias"
      description="Cambia tu idioma y tema preferidos."
    >
      {children}
    </AnnotatedSection>
  );
}

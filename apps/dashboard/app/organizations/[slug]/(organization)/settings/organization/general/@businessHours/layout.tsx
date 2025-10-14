import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function BusinessHoursLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Horario de trabajo"
      description="Horario laboral de tu organización."
    >
      {children}
    </AnnotatedSection>
  );
}

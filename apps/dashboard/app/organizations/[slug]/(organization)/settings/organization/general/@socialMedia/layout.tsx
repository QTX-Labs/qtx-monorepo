import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function SocialMediaLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Redes sociales"
      description="Agrega los enlaces de redes sociales de tu organización."
    >
      {children}
    </AnnotatedSection>
  );
}

import * as React from 'react';

import { baseUrl } from '@workspace/routes';
import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function ApiKeysLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Claves API"
      description="Estas claves permiten que otras aplicaciones controlen los recursos de tu organización. ¡Ten cuidado!"
      docLink={baseUrl.PublicApi}
    >
      {children}
    </AnnotatedSection>
  );
}

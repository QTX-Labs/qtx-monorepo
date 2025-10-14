import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function InvitationsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Invitaciones"
      description="Administra las invitaciones de usuarios que aún no han aceptado."
    >
      {children}
    </AnnotatedSection>
  );
}

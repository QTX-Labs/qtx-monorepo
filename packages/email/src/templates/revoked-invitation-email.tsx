import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type RevokedInvitationEmailProps = {
  appName: string;
  organizationName: string;
};

export function RevokedInvitationEmail({
  appName,
  organizationName
}: RevokedInvitationEmailProps): React.JSX.Element {
  return (
    <EmailLayout
      preview={`Invitación a ${organizationName} revocada en ${appName}`}
    >
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative elements */}
        <DecorativeBlob
          color={colors.accents.heartRed}
          size={240}
          position="top-left"
        />
        <DecorativeBlob
          color={colors.accents.warmOrange}
          size={280}
          position="bottom-right"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="invitation"
            main="revoked"
            scriptColor={colors.accents.warmOrange}
          />
        </Section>

        {/* Content card */}
        <Section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '40px',
            marginTop: '40px',
            position: 'relative'
          }}
        >
          <Text
            style={{
              fontFamily: fonts.script,
              fontSize: '26px',
              color: colors.accents.warmOrange,
              textAlign: 'center',
              margin: '0 0 30px 0'
            }}
          >
            hola 👋
          </Text>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '18px',
              color: colors.neutrals.white,
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '0 0 20px 0'
            }}
          >
            tu invitación para unirte a{' '}
            <strong style={{ color: colors.accents.heartRed }}>
              {organizationName}
            </strong>{' '}
            ha sido revocada.
          </Text>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '16px',
              color: colors.neutrals.nearWhite,
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '0'
            }}
          >
            si la revocación fue inesperada, solicita a un administrador de la
            organización que te envíe un nuevo enlace de invitación.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={{ marginTop: '40px' }}>
          <Hr
            style={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              margin: '40px 0 20px 0'
            }}
          />
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              margin: 0
            }}
          >
            este es un mensaje informativo de {appName}
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

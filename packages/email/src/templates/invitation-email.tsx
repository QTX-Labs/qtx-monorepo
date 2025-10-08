import * as React from 'react';
import { Section, Text, Hr, Link } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { EmailButton } from '../components/EmailButton';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type InvitationEmailProps = {
  appName: string;
  invitedByName: string;
  invitedByEmail: string;
  organizationName: string;
  inviteLink: string;
};

export function InvitationEmail({
  appName,
  invitedByName,
  invitedByEmail,
  organizationName,
  inviteLink
}: InvitationEmailProps): React.JSX.Element {
  return (
    <EmailLayout preview={`${invitedByName} te invita a ${organizationName}`}>
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative elements */}
        <DecorativeBlob
          color={colors.accents.warmOrange}
          size={250}
          position="top-left"
        />
        <DecorativeBlob
          color={colors.accents.coolCyan}
          size={300}
          position="bottom-right"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="you're invited to join"
            main={organizationName}
            scriptColor={colors.accents.sunnyYellow}
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
              fontSize: '28px',
              color: colors.accents.neonLime,
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
            <strong style={{ color: colors.accents.neonLime }}>
              {invitedByName}
            </strong>{' '}
            te ha invitado a unirte al equipo de{' '}
            <strong style={{ color: colors.accents.sunnyYellow }}>
              {organizationName}
            </strong>{' '}
            en {appName}.
          </Text>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '16px',
              color: colors.neutrals.nearWhite,
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '0 0 40px 0'
            }}
          >
            acepta la invitación para comenzar a colaborar con el equipo.
          </Text>

          <EmailButton
            href={inviteLink}
            backgroundColor={colors.accents.warmOrange}
            textColor={colors.neutrals.white}
          >
            aceptar invitación 🚀
          </EmailButton>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '30px 0 0 0'
            }}
          >
            o copia y pega este enlace:{' '}
            <Link
              href={inviteLink}
              style={{
                color: colors.accents.neonLime,
                textDecoration: 'underline'
              }}
            >
              {inviteLink}
            </Link>
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
            si no esperabas esta invitación, puedes ignorar este correo
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

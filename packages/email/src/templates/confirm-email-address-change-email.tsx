import * as React from 'react';
import { Section, Text, Hr, Link } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { EmailButton } from '../components/EmailButton';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type ConfirmEmailAddressChangeEmailProps = {
  name: string;
  confirmLink: string;
};

export function ConfirmEmailAddressChangeEmail({
  name,
  confirmLink
}: ConfirmEmailAddressChangeEmailProps): React.JSX.Element {
  return (
    <EmailLayout preview="Confirma tu nuevo correo electrónico">
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative elements */}
        <DecorativeBlob
          color={colors.accents.neonLime}
          size={280}
          position="top-left"
        />
        <DecorativeBlob
          color={colors.accents.coolCyan}
          size={220}
          position="bottom-right"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="confirm your new"
            main="email"
            scriptColor={colors.accents.coolCyan}
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
              color: colors.accents.neonLime,
              textAlign: 'center',
              margin: '0 0 30px 0'
            }}
          >
            hola {name} 👋
          </Text>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '18px',
              color: colors.neutrals.white,
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '0 0 40px 0'
            }}
          >
            para completar tu solicitud de cambio de correo electrónico, debes
            confirmar tu nueva dirección.
          </Text>

          <EmailButton
            href={confirmLink}
            backgroundColor={colors.accents.neonLime}
            textColor={colors.primary.electricBlue}
          >
            confirmar nuevo email ✓
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
              href={confirmLink}
              style={{
                color: colors.accents.neonLime,
                textDecoration: 'underline'
              }}
            >
              {confirmLink}
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
              lineHeight: '1.6',
              margin: 0
            }}
          >
            si no solicitaste este cambio, ignora este correo. no compartas este
            mensaje.
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

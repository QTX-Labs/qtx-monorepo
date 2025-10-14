import * as React from 'react';
import { Section, Text, Hr, Link } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { EmailButton } from '../components/EmailButton';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type PasswordResetEmailProps = {
  appName: string;
  name: string;
  resetPasswordLink: string;
};

export function PasswordResetEmail({
  appName,
  name,
  resetPasswordLink
}: PasswordResetEmailProps): React.JSX.Element {
  return (
    <EmailLayout preview={`Restablecer contraseña de ${appName}`}>
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative elements */}
        <DecorativeBlob
          color={colors.accents.heartRed}
          size={280}
          position="top-right"
        />
        <DecorativeBlob
          color={colors.accents.warmOrange}
          size={220}
          position="bottom-left"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="reset your"
            main="password"
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
              fontSize: '26px',
              color: colors.accents.neonLime,
              textAlign: 'center',
              margin: '0 0 30px 0'
            }}
          >
            hola {name} 🔐
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
            alguien solicitó cambiar la contraseña de tu cuenta en {appName}.
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
            si fuiste tú, puedes crear una nueva contraseña aquí:
          </Text>

          <EmailButton
            href={resetPasswordLink}
            backgroundColor={colors.accents.warmOrange}
            textColor={colors.neutrals.white}
          >
            restablecer contraseña 🔑
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
              href={resetPasswordLink}
              style={{
                color: colors.accents.neonLime,
                textDecoration: 'underline'
              }}
            >
              {resetPasswordLink}
            </Link>
          </Text>
        </Section>

        {/* Security note */}
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
            si no solicitaste este cambio, ignora este correo. para mantener tu
            cuenta segura, no compartas este mensaje.
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

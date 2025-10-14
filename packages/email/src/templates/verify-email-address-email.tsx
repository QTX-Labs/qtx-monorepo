import * as React from 'react';
import { Section, Text, Hr, Link } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { EmailButton } from '../components/EmailButton';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type VerifyEmailAddressEmailProps = {
  name: string;
  otp: string;
  verificationLink: string;
};

export function VerifyEmailAddressEmail({
  name,
  otp,
  verificationLink
}: VerifyEmailAddressEmailProps): React.JSX.Element {
  return (
    <EmailLayout preview="Verifica tu correo electrónico">
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative elements */}
        <DecorativeBlob
          color={colors.accents.coolCyan}
          size={260}
          position="top-left"
        />
        <DecorativeBlob
          color={colors.accents.neonLime}
          size={240}
          position="bottom-right"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="verify your"
            main="email"
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
            hola {name} ✉️
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
            para completar tu registro, necesitas verificar tu dirección de
            correo electrónico.
          </Text>

          <EmailButton
            href={verificationLink}
            backgroundColor={colors.accents.neonLime}
            textColor={colors.primary.electricBlue}
          >
            verificar email ✓
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
              href={verificationLink}
              style={{
                color: colors.accents.neonLime,
                textDecoration: 'underline'
              }}
            >
              {verificationLink}
            </Link>
          </Text>

          {/* OTP Code */}
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '30px',
              textAlign: 'center'
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: '14px',
                color: colors.neutrals.nearWhite,
                margin: '0 0 12px 0'
              }}
            >
              o usa este código de un solo uso:
            </Text>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: '32px',
                fontWeight: 900,
                color: colors.accents.sunnyYellow,
                letterSpacing: '4px',
                margin: 0
              }}
            >
              {otp}
            </Text>
          </div>
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
            si no solicitaste esta verificación, ignora este correo. no
            compartas este mensaje.
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

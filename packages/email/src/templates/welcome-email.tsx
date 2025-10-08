import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { EmailButton } from '../components/EmailButton';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type WelcomeEmailProps = {
  appName: string;
  name: string;
  getStartedLink: string;
};

export function WelcomeEmail({
  appName,
  name,
  getStartedLink
}: WelcomeEmailProps): React.JSX.Element {
  return (
    <EmailLayout preview={`¡Bienvenido a ${appName}, ${name}!`}>
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative blobs */}
        <DecorativeBlob
          color={colors.accents.sunnyYellow}
          size={300}
          position="top-right"
        />
        <DecorativeBlob
          color={colors.accents.neonLime}
          size={200}
          position="bottom-left"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="welcome to"
            main={appName}
            scriptColor={colors.accents.neonLime}
          />
        </Section>

        {/* Content */}
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
              fontSize: '24px',
              color: colors.accents.sunnyYellow,
              textAlign: 'center',
              margin: '0 0 20px 0'
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
              margin: '0 0 20px 0'
            }}
          >
            gracias por unirte a nuestra comunidad. estamos emocionados de
            tenerte con nosotros.
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
            tu cuenta está lista y puedes comenzar a explorar todas las
            funciones que tenemos para ti.
          </Text>

          <EmailButton href={getStartedLink}>empezar ahora ✨</EmailButton>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '16px',
              color: colors.neutrals.nearWhite,
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '20px 0 0 0'
            }}
          >
            si tienes preguntas, estamos aquí para ayudarte.
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
            recibes este correo porque te registraste en {appName}
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

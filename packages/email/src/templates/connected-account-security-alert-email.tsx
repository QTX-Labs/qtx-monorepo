import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type ConnectedAccountSecurityAlertEmailProps = {
  appName: string;
  name: string;
  provider: string;
  action: 'connected' | 'disconnected';
};

export function ConnectedAccountSecurityAlertEmail({
  appName,
  name,
  provider,
  action
}: ConnectedAccountSecurityAlertEmailProps): React.JSX.Element {
  return (
    <EmailLayout preview="¡Alerta de seguridad!">
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative elements */}
        <DecorativeBlob
          color={colors.accents.warmOrange}
          size={260}
          position="top-left"
        />
        <DecorativeBlob
          color={colors.accents.heartRed}
          size={240}
          position="bottom-right"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="security"
            main="alert!"
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
            el método de inicio de sesión{' '}
            <strong style={{ color: colors.accents.sunnyYellow }}>
              '{provider}'
            </strong>{' '}
            ha sido{' '}
            <strong
              style={{
                color:
                  action === 'connected'
                    ? colors.accents.neonLime
                    : colors.accents.heartRed
              }}
            >
              {action === 'connected' ? 'conectado a' : 'desconectado de'}
            </strong>{' '}
            tu cuenta.
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
            recibes este mensaje porque ha habido cambios de seguridad en tu
            cuenta de {appName}
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

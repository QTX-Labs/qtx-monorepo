import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';
import { HeroHeading } from '../components/HeroHeading';
import { DecorativeBlob } from '../components/DecorativeBlob';
import { colors, fonts } from '../components/design-system';

export type FeedbackEmailProps = {
  appName: string;
  organizationName: string;
  name: string;
  email: string;
  category: string;
  message: string;
};

export function FeedbackEmail({
  appName,
  organizationName,
  name,
  email,
  category,
  message
}: FeedbackEmailProps): React.JSX.Element {
  return (
    <EmailLayout preview="Nuevo comentario recibido">
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Decorative elements */}
        <DecorativeBlob
          color={colors.accents.sunnyYellow}
          size={270}
          position="top-left"
        />
        <DecorativeBlob
          color={colors.accents.neonLime}
          size={250}
          position="bottom-right"
        />

        {/* Hero */}
        <Section style={{ position: 'relative', zIndex: 10 }}>
          <HeroHeading
            script="new"
            main="feedback"
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
              fontSize: '24px',
              color: colors.accents.sunnyYellow,
              textAlign: 'center',
              margin: '0 0 30px 0'
            }}
          >
            comentario recibido 💬
          </Text>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px'
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: '14px',
                color: colors.neutrals.nearWhite,
                margin: '0 0 8px 0'
              }}
            >
              <strong style={{ color: colors.accents.neonLime }}>
                Organización:
              </strong>{' '}
              {organizationName}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: '14px',
                color: colors.neutrals.nearWhite,
                margin: '0 0 8px 0'
              }}
            >
              <strong style={{ color: colors.accents.neonLime }}>
                Nombre:
              </strong>{' '}
              {name}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: '14px',
                color: colors.neutrals.nearWhite,
                margin: '0 0 8px 0'
              }}
            >
              <strong style={{ color: colors.accents.neonLime }}>Email:</strong>{' '}
              {email}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: '14px',
                color: colors.neutrals.nearWhite,
                margin: '0 0 8px 0'
              }}
            >
              <strong style={{ color: colors.accents.neonLime }}>
                Categoría:
              </strong>{' '}
              {category}
            </Text>
          </div>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: '16px',
              color: colors.neutrals.white,
              lineHeight: '1.6',
              margin: '20px 0 0 0',
              whiteSpace: 'pre-wrap'
            }}
          >
            <strong style={{ color: colors.accents.sunnyYellow }}>
              Mensaje:
            </strong>
            <br />
            {message}
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
            recibes este correo porque alguien envió comentarios en {appName}
          </Text>
        </Section>
      </div>
    </EmailLayout>
  );
}

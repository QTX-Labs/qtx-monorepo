import * as React from 'react';
import { Body, Container, Html, Head, Preview } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { colors } from './design-system';

export type EmailLayoutProps = {
  preview: string;
  children: React.ReactNode;
  backgroundColor?: string;
};

export function EmailLayout({
  preview,
  children,
  backgroundColor = colors.primary.electricBlue
}: EmailLayoutProps): React.JSX.Element {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Pacifico&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          className="m-auto font-sans"
          style={{
            backgroundColor,
            padding: '0',
            margin: '0'
          }}
        >
          <Container
            className="mx-auto"
            style={{
              maxWidth: '600px',
              padding: '40px 20px'
            }}
          >
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

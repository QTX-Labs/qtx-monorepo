import * as React from 'react';
import { Button } from '@react-email/components';
import { colors, fonts } from './design-system';

export type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
};

export function EmailButton({
  href,
  children,
  backgroundColor = colors.accents.neonLime,
  textColor = colors.primary.electricBlue
}: EmailButtonProps): React.JSX.Element {
  return (
    <div style={{ textAlign: 'center', margin: '40px 0' }}>
      <Button
        href={href}
        style={{
          backgroundColor,
          color: textColor,
          fontFamily: fonts.display,
          fontSize: '18px',
          fontWeight: 700,
          padding: '16px 48px',
          borderRadius: '50px',
          textDecoration: 'none',
          display: 'inline-block',
          textTransform: 'lowercase',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {children}
      </Button>
    </div>
  );
}

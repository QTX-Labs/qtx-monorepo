import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { colors, fonts } from './design-system';

export type HeroHeadingProps = {
  script?: string;
  main: string;
  scriptColor?: string;
  mainColor?: string;
};

export function HeroHeading({
  script,
  main,
  scriptColor = colors.accents.neonLime,
  mainColor = colors.neutrals.white
}: HeroHeadingProps): React.JSX.Element {
  return (
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      {script && (
        <Text
          style={{
            fontFamily: fonts.script,
            fontSize: '36px',
            color: scriptColor,
            margin: '0 0 -10px 0',
            lineHeight: '1.2'
          }}
        >
          {script}
        </Text>
      )}
      <Heading
        style={{
          fontFamily: fonts.display,
          fontSize: '72px',
          fontWeight: 900,
          color: mainColor,
          margin: '0',
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          textTransform: 'lowercase'
        }}
      >
        {main}
      </Heading>
    </div>
  );
}

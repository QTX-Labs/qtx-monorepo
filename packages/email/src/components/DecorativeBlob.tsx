import * as React from 'react';

export type DecorativeBlobProps = {
  color: string;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

export function DecorativeBlob({
  color,
  size = 200,
  position = 'top-right'
}: DecorativeBlobProps): React.JSX.Element {
  const positions = {
    'top-left': { top: '-50px', left: '-50px' },
    'top-right': { top: '-50px', right: '-50px' },
    'bottom-left': { bottom: '-50px', left: '-50px' },
    'bottom-right': { bottom: '-50px', right: '-50px' }
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '43% 57% 44% 56% / 55% 58% 42% 45%',
        opacity: 0.3,
        ...positions[position]
      }}
    />
  );
}

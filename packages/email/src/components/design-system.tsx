/**
 * Human-First HR Design System
 * Bold, playful, emotionally intelligent design tokens for email templates
 */

export const colors = {
  primary: {
    electricBlue: '#0046FF',
    electricBlueDark: '#0038CC',
    electricBlueDarker: '#002A99',
    electricBlueDecorative: '#003ACC'
  },
  accents: {
    neonLime: '#00FF85',
    sunnyYellow: '#FFD600',
    warmOrange: '#FF9100',
    heartRed: '#E91E63',
    coolCyan: '#00BCD4'
  },
  neutrals: {
    white: '#FFFFFF',
    nearWhite: '#F8F9FA',
    textGray: '#666666'
  }
} as const;

export const fonts = {
  display: "'Poppins', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Pacifico', 'Caveat', cursive",
  body: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
} as const;

export const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '80px',
  xxl: '120px'
} as const;

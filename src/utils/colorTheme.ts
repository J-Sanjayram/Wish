// Color theme utility for wedding invitations
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  background: string;
  backgroundSecondary: string;
  border: string;
  glow: string;
}

// Convert hex to RGB values
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Calculate luminance for contrast checking
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Check if color is light or dark
const isLightColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5;
};

// Generate theme based on primary color with UX-optimized handling
export const generateColorTheme = (primaryColor: string): ColorTheme => {
  const rgb = hexToRgb(primaryColor);
  if (!rgb) {
    // Fallback to emerald if invalid color
    return generateColorTheme('#10b981');
  }

  const isLight = isLightColor(primaryColor);
  const { r, g, b } = rgb;

  // Special handling for white/black colors for better UX
  if (primaryColor.toLowerCase() === '#ffffff' || primaryColor.toLowerCase() === '#000000' || 
      (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
    
    if (isLight) {
      // White/very light color - use dark theme with colored accents
      return {
        primary: '#1f2937', // Dark gray as primary
        secondary: '#374151',
        accent: '#6366f1', // Indigo accent for visibility
        text: '#111827', // Very dark text
        textSecondary: '#374151',
        background: 'rgba(255, 255, 255, 0.95)',
        backgroundSecondary: 'rgba(249, 250, 251, 0.8)',
        border: 'rgba(55, 65, 81, 0.3)',
        glow: '99, 102, 241' // Indigo glow
      };
    } else {
      // Black/very dark color - use light theme with colored accents
      return {
        primary: '#f9fafb', // Light gray as primary
        secondary: '#e5e7eb',
        accent: '#f59e0b', // Amber accent for visibility
        text: '#ffffff', // White text
        textSecondary: '#d1d5db',
        background: 'rgba(17, 24, 39, 0.95)',
        backgroundSecondary: 'rgba(31, 41, 55, 0.8)',
        border: 'rgba(229, 231, 235, 0.3)',
        glow: '245, 158, 11' // Amber glow
      };
    }
  }

  // Generate complementary colors for normal colors
  const darken = (factor: number) => 
    `rgb(${Math.max(0, r - factor)}, ${Math.max(0, g - factor)}, ${Math.max(0, b - factor)})`;
  
  const lighten = (factor: number) => 
    `rgb(${Math.min(255, r + factor)}, ${Math.min(255, g + factor)}, ${Math.min(255, b + factor)})`;

  const withOpacity = (opacity: number) => 
    `rgba(${r}, ${g}, ${b}, ${opacity})`;

  return {
    primary: primaryColor,
    secondary: isLight ? darken(30) : lighten(30),
    accent: isLight ? darken(50) : lighten(50),
    text: isLight ? '#1f2937' : '#ffffff',
    textSecondary: isLight ? '#4b5563' : '#d1d5db',
    background: isLight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
    backgroundSecondary: isLight ? 'rgba(249, 250, 251, 0.8)' : 'rgba(17, 24, 39, 0.8)',
    border: withOpacity(0.3),
    glow: `${r}, ${g}, ${b}`
  };
};

// Generate CSS custom properties for the theme
export const generateThemeCSS = (theme: ColorTheme): string => {
  return `
    --theme-primary: ${theme.primary};
    --theme-secondary: ${theme.secondary};
    --theme-accent: ${theme.accent};
    --theme-text: ${theme.text};
    --theme-text-secondary: ${theme.textSecondary};
    --theme-background: ${theme.background};
    --theme-background-secondary: ${theme.backgroundSecondary};
    --theme-border: ${theme.border};
    --theme-glow: ${theme.glow};
  `;
};
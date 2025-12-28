export const colors = {
  primary: '#4F46E5',
  secondary: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#1E293B',
  textSecondary: '#475569',
  textLight: '#64748B',
  divider: '#E2E8F0',
  overlay: 'rgba(0,0,0,0.1)',
  success: '#059669',
  gradient: ['#FFFFFF', '#F8FAFC']
};

export const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  small: { fontSize: 14, fontWeight: 'normal' as const }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  }
};
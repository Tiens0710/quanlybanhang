import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, borderRadius, shadows } from '../../constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: number;
  margin?: number;
  shadowLevel?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 16, 
  margin = 0,
  shadowLevel = 'small',
  ...props 
}) => {
  return (
    <View 
      style={[
        styles.card, 
        shadows[shadowLevel],
        { padding, margin },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  }
});
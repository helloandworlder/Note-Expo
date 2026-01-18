import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';

interface PaperCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const PaperCard: React.FC<PaperCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.shadow} />
      <View style={styles.card}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: COLORS.shadowDark,
    borderRadius: BORDER_RADIUS.lg,
    opacity: 0.3,
  },
  card: {
    backgroundColor: COLORS.paperYellow,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

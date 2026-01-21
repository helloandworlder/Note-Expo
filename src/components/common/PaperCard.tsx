import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BORDER_RADIUS, ThemeColors, getThemeColors } from '../../constants/theme';
import { AppearanceType } from '../../types';

interface PaperCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  appearance?: AppearanceType;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  children,
  style,
  contentStyle,
  appearance = 'linen',
}) => {
  const themeColors = useMemo(
    () => getThemeColors(appearance),
    [appearance]
  );
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.shadow} />
      <View style={[styles.card, contentStyle]}>{children}</View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.shadowDark,
    borderRadius: BORDER_RADIUS.lg,
    opacity: 0.2,
  },
  card: {
    backgroundColor: colors.paperYellow,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
});

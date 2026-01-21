import React, { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, ViewStyle } from 'react-native';
import { ThemeColors, getThemeColors } from '../../constants/theme';
import { AppearanceType } from '../../types';

interface LinedPaperProps {
  children: React.ReactNode;
  lineHeight?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  appearance?: AppearanceType;
}

export const LinedPaper: React.FC<LinedPaperProps> = ({
  children,
  lineHeight = 26,
  style,
  contentStyle,
  appearance = 'linen',
}) => {
  const [height, setHeight] = useState(0);
  const themeColors = useMemo(() => getThemeColors(appearance), [appearance]);
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  };

  const lines = useMemo(() => {
    if (!height) return [];
    const count = Math.ceil(height / lineHeight);
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [height, lineHeight]);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <View pointerEvents="none" style={styles.lines}>
        {lines.map((line) => (
          <View
            key={`line-${line}`}
            style={[styles.line, { top: line * lineHeight }]}
          />
        ))}
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.paperYellow,
      position: 'relative',
      overflow: 'hidden',
    },
    lines: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    line: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.paperLine,
    },
    content: {
      position: 'relative',
    },
  });

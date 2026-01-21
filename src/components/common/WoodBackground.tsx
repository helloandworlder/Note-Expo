import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemeColors } from '../../constants/theme';
import { AppearanceType } from '../../types';

interface WoodBackgroundProps {
  children: React.ReactNode;
  variant?: AppearanceType;
}

export const WoodBackground: React.FC<WoodBackgroundProps> = ({
  children,
  variant = 'linen',
}) => {
  const themeColors = getThemeColors(variant);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          themeColors.woodLight,
          themeColors.woodBackground,
          themeColors.woodDark,
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});

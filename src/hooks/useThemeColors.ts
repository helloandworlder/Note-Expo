import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getThemeColors } from '../constants/theme';
import { AppearanceType } from '../types';

export const useThemeColors = (appearance: AppearanceType) => {
  const colorScheme = useColorScheme();

  return useMemo(
    () => getThemeColors(appearance, colorScheme),
    [appearance, colorScheme]
  );
};

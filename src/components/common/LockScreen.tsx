import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WoodBackground } from './WoodBackground';
import { PaperCard } from './PaperCard';
import {
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  FONTS,
  ThemeColors,
  getThemeColors,
} from '../../constants/theme';
import { useNoteStore } from '../../store/noteStore';
import { t } from '../../utils/i18n';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const appearance = useNoteStore((state) => state.settings.appearance);
  const themeColors = useMemo(() => getThemeColors(appearance), [appearance]);
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const authenticateWithBiometric = useCallback(async () => {
    try {
      if (isAuthenticating) return;
      setIsAuthenticating(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('lock.title'),
        fallbackLabel: t('lock.faceId'),
        cancelLabel: t('common.cancel'),
      });

      if (result.success) {
        onUnlock();
      }
    } catch (error) {
      console.error('生物识别认证失败:', error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, onUnlock]);

  const checkAndAuthenticate = useCallback(async () => {
    try {
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      setBiometricEnabled(biometric === 'true');

      if (biometric === 'true') {
        await authenticateWithBiometric();
      }
    } catch (error) {
      console.error('检查认证设置失败:', error);
    }
  }, [authenticateWithBiometric]);

  useEffect(() => {
    checkAndAuthenticate();
  }, [checkAndAuthenticate]);

  return (
    <WoodBackground variant={appearance}>
      <View style={styles.container}>
        <PaperCard style={styles.card} appearance={appearance}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>{t('lock.title')}</Text>
          <Text style={styles.subtitle}>{t('lock.subtitle')}</Text>

          {biometricEnabled ? (
            <TouchableOpacity
              style={styles.button}
              onPress={authenticateWithBiometric}
            >
              <Text style={styles.buttonText}>{t('lock.faceId')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.unavailableText}>{t('lock.unavailable')}</Text>
          )}
        </PaperCard>
      </View>
    </WoodBackground>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    icon: {
      fontSize: 64,
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: FONT_SIZES.heading,
      fontFamily: FONTS.display,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    subtitle: {
      fontSize: FONT_SIZES.medium,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginBottom: SPACING.xl,
    },
    button: {
      width: '100%',
      backgroundColor: colors.accent,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonText: {
      fontSize: FONT_SIZES.medium,
      fontFamily: FONTS.medium,
      fontWeight: '600',
      color: colors.paperWhite,
    },
    unavailableText: {
      fontSize: FONT_SIZES.medium,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
  });

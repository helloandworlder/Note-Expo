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
        <PaperCard
          style={styles.card}
          contentStyle={styles.cardContent}
          appearance={appearance}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🔒</Text>
          </View>
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
            <View style={styles.unavailableBox}>
              <Text style={styles.unavailableText}>{t('lock.unavailable')}</Text>
            </View>
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
    },
    cardContent: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.xl,
    },
    iconWrap: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.paperYellow,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.paperLine,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
      marginBottom: SPACING.lg,
    },
    icon: {
      fontSize: 32,
    },
    title: {
      fontSize: FONT_SIZES.heading,
      fontFamily: FONTS.display,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: FONT_SIZES.medium,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginBottom: SPACING.xl,
      textAlign: 'center',
      lineHeight: 20,
    },
    button: {
      width: '100%',
      backgroundColor: colors.accent,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accentDark,
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
    unavailableBox: {
      width: '100%',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: colors.paperLine,
      backgroundColor: colors.paperYellow,
      alignItems: 'center',
    },
    unavailableText: {
      fontSize: FONT_SIZES.medium,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
  });

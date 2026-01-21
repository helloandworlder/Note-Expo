import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
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
} from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useNoteStore } from '../../store/noteStore';
import { t } from '../../utils/i18n';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const appearance = useNoteStore((state) => state.settings.appearance);
  const themeColors = useThemeColors(appearance);
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const pulse = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  return (
    <WoodBackground variant={appearance}>
      <View style={styles.container}>
        <PaperCard
          style={styles.card}
          contentStyle={styles.cardContent}
          appearance={appearance}
        >
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseScale }] }]}>
            <Text style={styles.icon}>🔒</Text>
          </Animated.View>
          <Text style={styles.title}>{t('lock.title')}</Text>
          <Text style={styles.subtitle}>{t('lock.subtitle')}</Text>

          {biometricEnabled ? (
            <View style={styles.actionStack}>
              <TouchableOpacity
                style={styles.button}
                onPress={authenticateWithBiometric}
              >
                <Text style={styles.buttonText}>{t('lock.faceId')}</Text>
              </TouchableOpacity>
              <Animated.View style={[styles.hintRow, { opacity: pulseOpacity }]}>
                <View style={styles.hintDot} />
                <Text style={styles.hintText}>{t('lock.hint')}</Text>
              </Animated.View>
            </View>
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
    actionStack: {
      width: '100%',
      alignItems: 'center',
      gap: SPACING.sm,
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
    hintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    hintDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    hintText: {
      fontSize: FONT_SIZES.small,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkAndAuthenticate();
  }, []);

  const checkAndAuthenticate = async () => {
    try {
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      setBiometricEnabled(biometric === 'true');

      if (biometric === 'true') {
        await authenticateWithBiometric();
      }
    } catch (error) {
      console.error('检查认证设置失败:', error);
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '验证身份以访问笔记',
        fallbackLabel: '使用密码',
        cancelLabel: '取消',
      });

      if (result.success) {
        onUnlock();
      }
    } catch (error) {
      console.error('生物识别认证失败:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const storedPassword = await SecureStore.getItemAsync('appPassword');

      if (storedPassword === password) {
        onUnlock();
      } else {
        Alert.alert('错误', '密码不正确');
        setPassword('');
      }
    } catch (error) {
      Alert.alert('错误', '验证失败');
    }
  };

  return (
    <WoodBackground>
      <View style={styles.container}>
        <PaperCard style={styles.card}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>笔记已锁定</Text>
          <Text style={styles.subtitle}>请验证身份以继续</Text>

          <TextInput
            style={styles.input}
            placeholder="输入密码"
            placeholderTextColor={COLORS.textPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onSubmitEditing={handlePasswordSubmit}
          />

          <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
            <Text style={styles.buttonText}>解锁</Text>
          </TouchableOpacity>

          {biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={authenticateWithBiometric}
            >
              <Text style={styles.biometricButtonText}>使用 Face ID</Text>
            </TouchableOpacity>
          )}
        </PaperCard>
      </View>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.paperWhite,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.paperWhite,
  },
  biometricButton: {
    paddingVertical: SPACING.sm,
  },
  biometricButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
});

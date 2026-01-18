import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
    loadSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(compatible && enrolled);
  };

  const loadSettings = async () => {
    try {
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      const password = await SecureStore.getItemAsync('appPassword');
      setBiometricEnabled(biometric === 'true');
      setPasswordEnabled(!!password);
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '验证身份以启用生物识别',
        fallbackLabel: '使用密码',
      });

      if (result.success) {
        await AsyncStorage.setItem('biometricEnabled', 'true');
        setBiometricEnabled(true);
        Alert.alert('成功', 'Face ID 已启用');
      } else {
        Alert.alert('失败', '身份验证失败');
      }
    } else {
      await AsyncStorage.setItem('biometricEnabled', 'false');
      setBiometricEnabled(false);
      Alert.alert('成功', 'Face ID 已禁用');
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 4) {
      Alert.alert('错误', '密码至少需要4位');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致');
      return;
    }

    try {
      await SecureStore.setItemAsync('appPassword', password);
      setPasswordEnabled(true);
      setShowPasswordModal(false);
      setPassword('');
      setConfirmPassword('');
      Alert.alert('成功', '密码已设置');
    } catch (error) {
      Alert.alert('错误', '设置密码失败');
    }
  };

  const handleRemovePassword = async () => {
    Alert.alert('移除密码', '确定要移除密码保护吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('appPassword');
          setPasswordEnabled(false);
          Alert.alert('成功', '密码已移除');
        },
      },
    ]);
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>设置</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 设置项 */}
        <View style={styles.content}>
          <PaperCard style={styles.section}>
            <Text style={styles.sectionTitle}>安全设置</Text>

            {/* Face ID */}
            {isBiometricAvailable && (
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🔐</Text>
                  <View>
                    <Text style={styles.settingLabel}>Face ID</Text>
                    <Text style={styles.settingDescription}>
                      使用面容识别保护笔记
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  trackColor={{
                    false: COLORS.textPlaceholder,
                    true: COLORS.accent,
                  }}
                  thumbColor={COLORS.paperWhite}
                />
              </View>
            )}

            {/* 密码锁定 */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔑</Text>
                <View>
                  <Text style={styles.settingLabel}>密码锁定</Text>
                  <Text style={styles.settingDescription}>
                    {passwordEnabled ? '已设置密码' : '设置密码保护'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (passwordEnabled) {
                    handleRemovePassword();
                  } else {
                    setShowPasswordModal(true);
                  }
                }}
              >
                <Text style={styles.buttonText}>
                  {passwordEnabled ? '移除' : '设置'}
                </Text>
              </TouchableOpacity>
            </View>
          </PaperCard>

          <PaperCard style={styles.section}>
            <Text style={styles.sectionTitle}>关于</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📱</Text>
                <View>
                  <Text style={styles.settingLabel}>应用版本</Text>
                  <Text style={styles.settingDescription}>1.0.0</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>💡</Text>
                <View>
                  <Text style={styles.settingLabel}>功能特性</Text>
                  <Text style={styles.settingDescription}>
                    拟物风格 · 富文本 · Markdown
                  </Text>
                </View>
              </View>
            </View>
          </PaperCard>
        </View>

        {/* 密码设置模态框 */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>设置密码</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="输入密码（至少4位）"
                placeholderTextColor={COLORS.textPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
              />

              <TextInput
                style={styles.modalInput}
                placeholder="确认密码"
                placeholderTextColor={COLORS.textPlaceholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={styles.modalButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleSetPassword}
                >
                  <Text style={styles.modalButtonText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.woodLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.paperWhite,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: COLORS.paperYellow,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  modalButtonCancel: {
    backgroundColor: COLORS.textPlaceholder,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.accent,
  },
  modalButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.paperWhite,
  },
});

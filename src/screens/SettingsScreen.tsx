import React, { useEffect, useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import {
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  ThemeColors,
  getThemeColors,
} from '../constants/theme';
import { useNoteStore } from '../store/noteStore';
import { AppSettings } from '../types';
import { t } from '../utils/i18n';

interface SettingsScreenProps {
  navigation: any;
}

type PickerKey = keyof Pick<
  AppSettings,
  'defaultFormatType' | 'fontSize' | 'appearance' | 'noteSort'
>;

const DEFAULT_OPTIONS: Record<PickerKey, { value: string; label: string }[]> = {
  defaultFormatType: [
    { value: 'plain', label: t('format.plain') },
    { value: 'rtf', label: t('format.rich') },
    { value: 'markdown', label: t('format.markdown') },
  ],
  fontSize: [
    { value: 'small', label: t('settings.textSmall') },
    { value: 'medium', label: t('settings.textMedium') },
    { value: 'large', label: t('settings.textLarge') },
  ],
  appearance: [
    { value: 'linen', label: t('settings.appearanceLinen') },
    { value: 'paper', label: t('settings.appearancePaper') },
    { value: 'wood', label: t('settings.appearanceWood') },
  ],
  noteSort: [
    { value: 'updated-desc', label: t('settings.sortUpdatedDesc') },
    { value: 'updated-asc', label: t('settings.sortUpdatedAsc') },
    { value: 'created-desc', label: t('settings.sortCreatedDesc') },
    { value: 'created-asc', label: t('settings.sortCreatedAsc') },
  ],
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { settings, updateSettings } = useNoteStore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [activePicker, setActivePicker] = useState<PickerKey | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
    loadSettings();
  }, []);

  const themeColors = useMemo(
    () => getThemeColors(settings.appearance),
    [settings.appearance]
  );
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(compatible && enrolled);
  };

  const loadSettings = async () => {
    try {
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      setBiometricEnabled(biometric === 'true');
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('settings.faceId'),
        fallbackLabel: t('settings.faceId'),
      });

      if (result.success) {
        await AsyncStorage.setItem('biometricEnabled', 'true');
        setBiometricEnabled(true);
        Alert.alert(t('common.success'), t('settings.faceId'));
      } else {
        Alert.alert(t('common.error'), t('settings.faceIdDesc'));
      }
    } else {
      await AsyncStorage.setItem('biometricEnabled', 'false');
      setBiometricEnabled(false);
    }
  };

  const renderPickerModal = () => {
    if (!activePicker) return null;

    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
        >
          <View style={styles.pickerContent}>
            {DEFAULT_OPTIONS[activePicker].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerItem}
                onPress={() => {
                  updateSettings({
                    [activePicker]: option.value,
                  } as Partial<AppSettings>);
                  setActivePicker(null);
                }}
              >
                <Text style={styles.pickerItemText}>{option.label}</Text>
                {settings[activePicker] === option.value && (
                  <Ionicons name="checkmark" size={18} color={themeColors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <WoodBackground variant={settings.appearance}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <PaperCard style={styles.section} appearance={settings.appearance}>
            <Text style={styles.sectionTitle}>{t('settings.sectionEditor')}</Text>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setActivePicker('defaultFormatType')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.defaultFormat')}</Text>
                <Text style={styles.settingDescription}>
                  {
                    DEFAULT_OPTIONS.defaultFormatType.find(
                      (option) => option.value === settings.defaultFormatType
                    )?.label
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setActivePicker('fontSize')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.textSize')}</Text>
                <Text style={styles.settingDescription}>
                  {
                    DEFAULT_OPTIONS.fontSize.find(
                      (option) => option.value === settings.fontSize
                    )?.label
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </PaperCard>

          <PaperCard style={styles.section} appearance={settings.appearance}>
            <Text style={styles.sectionTitle}>{t('settings.sectionShare')}</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.shareFooter')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.footerHint')}
                </Text>
              </View>
              <Switch
                value={settings.shareFooterEnabled}
                onValueChange={(value) =>
                  updateSettings({ shareFooterEnabled: value })
                }
                trackColor={{
                  false: themeColors.textPlaceholder,
                  true: themeColors.accent,
                }}
                thumbColor={themeColors.paperWhite}
              />
            </View>
            {settings.shareFooterEnabled && (
              <TextInput
                style={styles.footerInput}
                placeholder={t('settings.shareFooterPlaceholder')}
                placeholderTextColor={themeColors.textPlaceholder}
                value={settings.shareFooterText}
                onChangeText={(text) => updateSettings({ shareFooterText: text })}
              />
            )}
          </PaperCard>

          <PaperCard style={styles.section} appearance={settings.appearance}>
            <Text style={styles.sectionTitle}>{t('settings.sectionAppearance')}</Text>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setActivePicker('appearance')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.appearance')}</Text>
                <Text style={styles.settingDescription}>
                  {
                    DEFAULT_OPTIONS.appearance.find(
                      (option) => option.value === settings.appearance
                    )?.label
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </PaperCard>

          <PaperCard style={styles.section} appearance={settings.appearance}>
            <Text style={styles.sectionTitle}>{t('settings.sectionSort')}</Text>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setActivePicker('noteSort')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.sort')}</Text>
                <Text style={styles.settingDescription}>
                  {
                    DEFAULT_OPTIONS.noteSort.find(
                      (option) => option.value === settings.noteSort
                    )?.label
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </PaperCard>

          <PaperCard style={styles.section} appearance={settings.appearance}>
            <Text style={styles.sectionTitle}>{t('settings.sectionSecurity')}</Text>
            {isBiometricAvailable ? (
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>{t('settings.faceId')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('settings.faceIdDesc')}
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  accessibilityLabel="faceid-switch"
                  trackColor={{
                    false: themeColors.textPlaceholder,
                    true: themeColors.accent,
                  }}
                  thumbColor={themeColors.paperWhite}
                />
              </View>
            ) : (
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>{t('settings.faceId')}</Text>
                  <Text style={styles.settingDescription}>{t('lock.unavailable')}</Text>
                </View>
              </View>
            )}
          </PaperCard>

          <PaperCard style={styles.section} appearance={settings.appearance}>
            <Text style={styles.sectionTitle}>{t('settings.sectionAbout')}</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.language')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.systemLanguage')}
                </Text>
              </View>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.version')}</Text>
                <Text style={styles.settingDescription}>1.0.0</Text>
              </View>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{t('settings.features')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.featureDesc')}
                </Text>
              </View>
            </View>
          </PaperCard>
        </View>
        {renderPickerModal()}
      </SafeAreaView>
    </WoodBackground>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.woodLight,
  },
  settingLeft: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.small,
    color: colors.textSecondary,
  },
  footerInput: {
    backgroundColor: colors.paperYellow,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.medium,
    color: colors.textPrimary,
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  pickerContent: {
    backgroundColor: colors.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  pickerItemText: {
    fontSize: FONT_SIZES.medium,
    color: colors.textPrimary,
  },
});

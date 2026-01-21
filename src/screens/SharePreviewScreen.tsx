import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import { LinedPaper } from '../components/common/LinedPaper';
import {
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  FONT_SCALE,
  FONTS,
  ThemeColors,
  getThemeColors,
} from '../constants/theme';
import { Note } from '../types';
import { useNoteStore } from '../store/noteStore';
import { getPlainText } from '../utils/contentConverter';
import { formatShareFooter } from '../utils/shareFooter';
import { t } from '../utils/i18n';

interface SharePreviewScreenProps {
  navigation: any;
  route: any;
}

export const SharePreviewScreen: React.FC<SharePreviewScreenProps> = ({
  navigation,
  route,
}) => {
  const { note } = route.params as { note: Note };
  const { settings } = useNoteStore();
  const contentRef = useRef<View>(null);

  const fontScale = FONT_SCALE[settings.fontSize];
  const contentFontSize = Math.round(FONT_SIZES.medium * fontScale);
  const titleFontSize = Math.round(FONT_SIZES.heading * fontScale);
  const lineHeight = Math.round(28 * fontScale);
  const themeColors = useMemo(
    () => getThemeColors(settings.appearance),
    [settings.appearance]
  );
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const plainText = useMemo(
    () => getPlainText(note.content, note.richContent, note.formatType),
    [note]
  );

  const footerText = useMemo(() => {
    if (!settings.shareFooterEnabled) return '';
    return formatShareFooter(settings.shareFooterText, note.updatedAt);
  }, [settings.shareFooterEnabled, settings.shareFooterText, note.updatedAt]);

  const handleCapture = async () => {
    if (!contentRef.current) return null;
    return captureRef(contentRef, { format: 'png', quality: 1 });
  };

  const handleShare = async () => {
    try {
      const uri = await handleCapture();
      if (uri) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error('分享图片失败:', error);
      Alert.alert(t('common.error'), t('editor.exportImageError'));
    }
  };

  const handleSave = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), t('editor.imagePermission'));
        return;
      }
      const uri = await handleCapture();
      if (uri) {
        await MediaLibrary.createAssetAsync(uri);
        Alert.alert(t('common.success'), t('editor.imageSaveSuccess'));
      }
    } catch (error) {
      console.error('保存分享图片失败:', error);
      Alert.alert(t('common.error'), t('editor.imageSaveError'));
    }
  };

  return (
    <WoodBackground variant={settings.appearance}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('share.title')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={themeColors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Ionicons name="download-outline" size={20} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View ref={contentRef} collapsable={false}>
            <PaperCard
              style={styles.paperCard}
              contentStyle={styles.paperContent}
              appearance={settings.appearance}
            >
              <LinedPaper
                lineHeight={lineHeight}
                contentStyle={styles.linedContent}
                appearance={settings.appearance}
              >
                <Text style={[styles.title, { fontSize: titleFontSize }]}>
                  {note.title || t('note.untitled')}
                </Text>
                <Text
                  style={[
                    styles.contentText,
                    { fontSize: contentFontSize, lineHeight: lineHeight },
                  ]}
                >
                  {plainText || t('note.empty')}
                </Text>

                {note.images.map((image) => (
                  <View key={image.id} style={styles.imageBlock}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    {image.caption ? (
                      <Text style={styles.imageCaption}>{image.caption}</Text>
                    ) : null}
                  </View>
                ))}

                {footerText ? (
                  <Text style={styles.footerText}>{footerText}</Text>
                ) : null}
              </LinedPaper>
            </PaperCard>
          </View>
        </ScrollView>
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
    backgroundColor: colors.paperWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.paperLine,
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.display,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  paperCard: {
    borderRadius: BORDER_RADIUS.lg,
  },
  paperContent: {
    padding: 0,
  },
  linedContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.heading,
    fontFamily: FONTS.display,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.md,
  },
  contentText: {
    fontFamily: FONTS.regular,
    color: colors.textPrimary,
  },
  imageBlock: {
    marginTop: SPACING.lg,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: BORDER_RADIUS.md,
  },
  imageCaption: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.regular,
    color: colors.textSecondary,
  },
  footerText: {
    marginTop: SPACING.xl,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});

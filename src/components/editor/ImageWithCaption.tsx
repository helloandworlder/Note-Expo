import React, { useMemo, useState } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { NoteImage, AppearanceType } from '../../types';
import { FONTS, ThemeColors, getThemeColors } from '../../constants/theme';
import { t } from '../../utils/i18n';

interface ImageWithCaptionProps {
  image: NoteImage;
  onCaptionChange: (caption: string) => void;
  onOptionsPress: () => void;
  onPressImage: () => void;
  appearance?: AppearanceType;
}

export const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({
  image,
  onCaptionChange,
  onOptionsPress,
  onPressImage,
  appearance = 'linen',
}) => {
  const [caption, setCaption] = useState(image.caption || '');
  const themeColors = useMemo(() => getThemeColors(appearance), [appearance]);
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const handleCaptionChange = (text: string) => {
    setCaption(text);
    onCaptionChange(text);
  };

  // 计算图片显示尺寸
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = screenWidth - 64; // 左右各留32px边距
  const imageWidth = image.width && image.width < maxWidth ? image.width : maxWidth;
  const imageHeight = image.width && image.height
    ? (imageWidth / image.width) * image.height
    : 200;

  return (
    <View style={styles.container}>
      {/* 图片显示区域 */}
      <View style={styles.imageContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={onPressImage}>
          <Image
            source={{ uri: image.uri }}
            style={[
              styles.image,
              {
                width: imageWidth,
                height: imageHeight,
              },
            ]}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionsButton} onPress={onOptionsPress}>
          <Text style={styles.optionsButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* 备注输入框 */}
      <View style={styles.captionContainer}>
        <Text style={styles.captionIcon}>📝</Text>
        <TextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={handleCaptionChange}
          placeholder={t('editor.imageNotePlaceholder')}
          placeholderTextColor={themeColors.textSecondary}
          multiline
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.paper,
      borderRadius: 12,
      marginVertical: 12,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imageContainer: {
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 8,
    },
    image: {
      borderRadius: 8,
    },
  optionsButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.paperWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.paperLineStrong,
  },
  optionsButtonText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },
    captionContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.paper,
    },
    captionIcon: {
      fontSize: 20,
      marginRight: 8,
      marginTop: 2,
    },
    captionInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontFamily: FONTS.regular,
      minHeight: 40,
      textAlignVertical: 'top',
    },
  });

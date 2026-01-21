import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import Markdown from 'react-native-markdown-display';
import { actions } from 'react-native-pell-rich-editor';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import { LinedPaper } from '../components/common/LinedPaper';
import {
  RichTextEditor,
  RichTextEditorHandle,
} from '../components/editor/RichTextEditor';
import { ImageWithCaption } from '../components/editor/ImageWithCaption';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useNoteStore } from '../store/noteStore';
import {
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  FONT_SCALE,
  FORMAT_OPTIONS,
  FONTS,
  ThemeColors,
} from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';
import { FormatType, NoteImage } from '../types';
import { getPlainText, stripHtml } from '../utils/contentConverter';
import { formatDateTime, t } from '../utils/i18n';

interface EditorScreenProps {
  navigation: any;
  route: any;
}

const TOOLBAR_ITEMS = [
  { key: 'title', icon: 'format-size', labelKey: 'toolbar.title' },
  { key: 'center', icon: 'format-align-center', labelKey: 'toolbar.center' },
  { key: 'list', icon: 'format-list-bulleted', labelKey: 'toolbar.list' },
  { key: 'bold', icon: 'format-bold', labelKey: 'toolbar.bold' },
  { key: 'quote', icon: 'format-quote-open', labelKey: 'toolbar.quote' },
  { key: 'todo', icon: 'format-list-checks', labelKey: 'toolbar.todo' },
];

export const EditorScreen: React.FC<EditorScreenProps> = ({ navigation, route }) => {
  const { noteId } = route.params || {};
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    folders,
    settings,
  } = useNoteStore();

  const existingNote = noteId ? notes.find((note) => note.id === noteId) : null;
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    noteId || null
  );
  const activeNote = useMemo(
    () => (currentNoteId ? notes.find((note) => note.id === currentNoteId) : null),
    [currentNoteId, notes]
  );

  const contentHistory = useUndoRedo(existingNote?.content || '');
  const [title, setTitle] = useState(existingNote?.title || '');
  const [richContent, setRichContent] = useState(existingNote?.richContent || '');
  const [formatType, setFormatType] = useState<FormatType>(
    existingNote?.formatType || settings.defaultFormatType
  );
  const [images, setImages] = useState<NoteImage[]>(existingNote?.images || []);
  const [isFavorite, setIsFavorite] = useState(existingNote?.isFavorite || false);
  const [folderId] = useState<string | null>(existingNote?.folderId || null);

  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [activeImage, setActiveImage] = useState<NoteImage | null>(null);

  const richEditorRef = useRef<RichTextEditorHandle>(null);
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const plainText = useMemo(
    () => getPlainText(contentHistory.value, richContent, formatType),
    [contentHistory.value, richContent, formatType]
  );

  const wordCount = useMemo(
    () => plainText.replace(/\s+/g, '').length,
    [plainText]
  );

  const fontScale = FONT_SCALE[settings.fontSize];
  const contentFontSize = Math.round(FONT_SIZES.medium * fontScale);
  const titleFontSize = Math.round(FONT_SIZES.heading * fontScale);
  const lineHeight = Math.round(28 * fontScale);
  const themeColors = useThemeColors(settings.appearance);
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const markdownStyles = useMemo(
    () =>
      ({
      body: {
        fontSize: contentFontSize,
        fontFamily: FONTS.regular,
        color: themeColors.textPrimary,
        lineHeight: lineHeight,
      },
      heading1: {
        fontSize: Math.round(contentFontSize * 1.5),
        fontWeight: 'bold',
        fontFamily: FONTS.display,
        color: themeColors.textPrimary,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
      },
      heading2: {
        fontSize: Math.round(contentFontSize * 1.3),
        fontWeight: 'bold',
        fontFamily: FONTS.display,
        color: themeColors.textPrimary,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
      },
      strong: {
        fontWeight: 'bold',
      },
      em: {
        fontStyle: 'italic',
      },
      blockquote: {
        backgroundColor: themeColors.paperWhite,
        borderLeftWidth: 4,
        borderLeftColor: themeColors.accent,
        paddingLeft: SPACING.md,
        paddingVertical: SPACING.sm,
        marginVertical: SPACING.sm,
      },
      list_item: {
        marginVertical: SPACING.xs,
      },
    }) as any,
    [contentFontSize, lineHeight, themeColors]
  );

  const folderName = useMemo(() => {
    if (!folderId) return t('home.folderAll');
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) return t('home.folderAll');
    if (folder.id === 'favorites') return t('home.folderFavorites');
    if (folder.id === 'all') return t('home.folderAll');
    return folder.name;
  }, [folderId, folders]);

  const currentFormatLabel = useMemo(() => {
    const option = FORMAT_OPTIONS.find((item) => item.value === formatType);
    return option ? t(option.labelKey) : t('format.plain');
  }, [formatType]);

  const resolveNoteData = useCallback(() => {
    const noteData: any = {
      title,
      formatType,
      images,
      isFavorite,
      folderId,
    };

    if (formatType === 'rtf') {
      noteData.richContent = richContent;
      noteData.content = stripHtml(richContent);
    } else {
      noteData.content = contentHistory.value;
      noteData.richContent = '';
    }

    return noteData;
  }, [
    title,
    formatType,
    images,
    isFavorite,
    folderId,
    richContent,
    contentHistory.value,
  ]);

  const persistNote = useCallback(
    (shouldNavigate: boolean) => {
      const shouldSave =
        title.trim() || plainText.trim() || images.length > 0 || isFavorite;

      if (!shouldSave) {
        if (shouldNavigate) navigation.goBack();
        return;
      }

      const noteData = resolveNoteData();
      if (currentNoteId) {
        updateNote(currentNoteId, noteData);
      } else {
        const newId = addNote(noteData);
        setCurrentNoteId(newId);
      }

      if (shouldNavigate) {
        navigation.goBack();
      }
    },
    [
      title,
      plainText,
      images,
      isFavorite,
      resolveNoteData,
      currentNoteId,
      updateNote,
      addNote,
      navigation,
    ]
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(() => {
      persistNote(false);
    }, 800);

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [persistNote]);

  const handleDelete = () => {
    Alert.alert(t('editor.deleteTitle'), t('editor.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          if (currentNoteId) {
            deleteNote(currentNoteId);
          }
          navigation.goBack();
        },
      },
    ]);
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    if (currentNoteId) {
      toggleFavorite(currentNoteId);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newImage: NoteImage = {
        id: Date.now().toString(),
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      };
      setImages((prev) => [...prev, newImage]);
    }
  };

  const handleUpdateImage = (imageId: string, updates: Partial<NoteImage>) => {
    setImages((prev) =>
      prev.map((image) =>
        image.id === imageId ? { ...image, ...updates } : image
      )
    );
    if (activeImage?.id === imageId) {
      setActiveImage({ ...activeImage, ...updates });
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setImages((prev) => prev.filter((image) => image.id !== imageId));
  };

  const handleCropImage = async () => {
    if (!activeImage) return;
    try {
      const width = activeImage.width || 0;
      const height = activeImage.height || 0;
      if (!width || !height) return;

      const size = Math.min(width, height);
      const originX = Math.max(0, Math.floor((width - size) / 2));
      const originY = Math.max(0, Math.floor((height - size) / 2));

      const result = await ImageManipulator.manipulateAsync(
        activeImage.uri,
        [
          {
            crop: {
              originX,
              originY,
              width: size,
              height: size,
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      handleUpdateImage(activeImage.id, {
        uri: result.uri,
        width: size,
        height: size,
      });
    } catch (error) {
      console.error('裁剪图片失败:', error);
      Alert.alert(t('common.error'), t('editor.imageSaveError'));
    }
  };

  const handleSaveImageToAlbum = async () => {
    if (!activeImage) return;
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), t('editor.imagePermission'));
        return;
      }

      await MediaLibrary.createAssetAsync(activeImage.uri);
      Alert.alert(t('common.success'), t('editor.imageSaveSuccess'));
    } catch (error) {
      console.error('保存图片失败:', error);
      Alert.alert(t('common.error'), t('editor.imageSaveError'));
    }
  };

  const handleExportText = async () => {
    await Clipboard.setStringAsync(plainText);
    Alert.alert(t('common.success'), t('editor.copySuccess'));
    setShowExportMenu(false);
  };

  const handleExportImage = async () => {
    setShowExportMenu(false);
    navigation.navigate('SharePreview', {
      note: {
        id: currentNoteId || Date.now().toString(),
        title,
        content: contentHistory.value,
        richContent,
        formatType,
        images,
        folderId,
        isFavorite,
        createdAt: existingNote?.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
    });
  };

  const handleExportPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: ${themeColors.textPrimary}; }
              p { color: ${themeColors.textSecondary}; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${title || t('note.untitled')}</h1>
            <p>${plainText.replace(/\n/g, '<br>')}</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('导出 PDF 失败:', error);
      Alert.alert(t('common.error'), t('editor.exportPdfError'));
    }
    setShowExportMenu(false);
  };

  const handleUndo = () => {
    if (formatType === 'rtf') {
      richEditorRef.current?.undo();
    } else {
      contentHistory.undo();
    }
  };

  const handleRedo = () => {
    if (formatType === 'rtf') {
      richEditorRef.current?.redo();
    } else {
      contentHistory.redo();
    }
  };

  const handleToolbarAction = (key: string) => {
    if (formatType === 'rtf') {
      const actionMap: Record<string, actions> = {
        title: actions.heading1,
        center: actions.alignCenter,
        list: actions.insertBulletsList,
        bold: actions.setBold,
        quote: actions.blockquote,
        todo: actions.checkboxList,
      };
      const action = actionMap[key];
      if (action) richEditorRef.current?.applyAction(action);
      return;
    }

    const appendLine = (text: string) => {
      const current = contentHistory.value;
      const next = current ? `${current}\n${text}` : text;
      contentHistory.set(next);
    };

    const labelMap = {
      title: t('toolbar.title'),
      center: t('toolbar.center'),
      list: t('toolbar.list'),
      bold: t('toolbar.bold'),
      quote: t('toolbar.quote'),
      todo: t('toolbar.todo'),
    };

    switch (key) {
      case 'title':
        appendLine(
          formatType === 'markdown'
            ? `# ${labelMap.title}`
            : labelMap.title
        );
        break;
      case 'center':
        appendLine(
          formatType === 'markdown'
            ? `<div align="center">${labelMap.center}</div>`
            : labelMap.center
        );
        break;
      case 'list':
        appendLine(
          formatType === 'markdown'
            ? `- ${labelMap.list}`
            : `• ${labelMap.list}`
        );
        break;
      case 'bold':
        appendLine(
          formatType === 'markdown'
            ? `**${labelMap.bold}**`
            : labelMap.bold
        );
        break;
      case 'quote':
        appendLine(
          formatType === 'markdown'
            ? `> ${labelMap.quote}`
            : labelMap.quote
        );
        break;
      case 'todo':
        appendLine(
          formatType === 'markdown'
            ? `- [ ] ${labelMap.todo}`
            : `☐ ${labelMap.todo}`
        );
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    if (formatType === 'rtf') {
      return (
        <RichTextEditor
          ref={richEditorRef}
          initialContent={richContent}
          onChange={setRichContent}
          style={styles.richEditor}
          fontSize={contentFontSize}
          placeholder={t('editor.contentPlaceholder')}
          appearance={settings.appearance}
        />
      );
    }

    return (
      <TextInput
        style={[
          styles.contentInput,
          { fontSize: contentFontSize, lineHeight: lineHeight },
        ]}
        value={contentHistory.value}
        onChangeText={contentHistory.set}
        placeholder={
          formatType === 'markdown'
            ? t('editor.markdownPlaceholder')
            : t('editor.contentPlaceholder')
        }
        placeholderTextColor={themeColors.textPlaceholder}
        multiline
        textAlignVertical="top"
      />
    );
  };

  return (
    <WoodBackground variant={settings.appearance}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={22} color={themeColors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUndo}>
                <Ionicons
                  name="arrow-undo"
                  size={20}
                  color={
                    formatType === 'rtf' || contentHistory.canUndo
                      ? themeColors.textPrimary
                      : themeColors.textPlaceholder
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRedo}>
                <Ionicons
                  name="arrow-redo"
                  size={20}
                  color={
                    formatType === 'rtf' || contentHistory.canRedo
                      ? themeColors.textPrimary
                      : themeColors.textPlaceholder
                  }
                />
              </TouchableOpacity>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.aiChip}>
                <Text style={styles.aiText}>AI</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickImage}>
                <Ionicons name="image" size={22} color={themeColors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => persistNote(true)}
                accessibilityLabel="save-note"
              >
                <Ionicons name="checkmark" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <View style={styles.folderChip}>
                <Ionicons name="folder" size={12} color={themeColors.textSecondary} />
                <Text style={styles.folderChipText}>{folderName}</Text>
              </View>
              <Text style={styles.metaText}>
                {t('editor.metaDate', {
                  time: formatDateTime(activeNote?.updatedAt || Date.now()),
                })}
              </Text>
              <Text style={styles.metaDivider}>|</Text>
              <Text style={styles.metaText}>
                {t('editor.wordCount', { count: wordCount })}
              </Text>
            </View>
            <View style={styles.metaRight}>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                accessibilityLabel="toggle-favorite"
              >
                <Ionicons
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={18}
                  color={isFavorite ? themeColors.favorite : themeColors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.formatChip}
                onPress={() => setShowFormatMenu(true)}
              >
                <Text style={styles.formatChipText}>{currentFormatLabel}</Text>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowExportMenu(true)}>
                <Ionicons name="share-outline" size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
              {currentNoteId && (
                <TouchableOpacity onPress={handleDelete}>
                  <Ionicons name="trash" size={18} color={themeColors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.editorContainer}>
            <View style={styles.editorContent}>
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
                  <TextInput
                    style={[
                      styles.titleInput,
                      { fontSize: titleFontSize, lineHeight: lineHeight },
                    ]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('editor.titlePlaceholder')}
                    placeholderTextColor={themeColors.textPlaceholder}
                  />

                  {renderContent()}

                  {formatType === 'markdown' && contentHistory.value ? (
                    <View style={styles.previewContainer}>
                      <Text style={styles.previewLabel}>{t('editor.previewLabel')}</Text>
                      <Markdown style={markdownStyles}>{contentHistory.value}</Markdown>
                    </View>
                  ) : null}

                  {images.map((image) => (
                    <ImageWithCaption
                      key={image.id}
                      image={image}
                      onCaptionChange={(caption) =>
                        handleUpdateImage(image.id, { caption })
                      }
                      onOptionsPress={() => {
                        setActiveImage(image);
                        setShowImageActions(true);
                      }}
                      onPressImage={() => {
                        setActiveImage(image);
                        setShowImagePreview(true);
                      }}
                      appearance={settings.appearance}
                    />
                  ))}
                </LinedPaper>
              </PaperCard>
            </View>
          </ScrollView>

          <View style={styles.bottomToolbar}>
            {TOOLBAR_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.toolbarButton}
                onPress={() => handleToolbarAction(item.key)}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={18}
                  color={themeColors.toolbarIcon}
                />
                <Text style={styles.toolbarLabel}>{t(item.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Modal
            visible={showFormatMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFormatMenu(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowFormatMenu(false)}
            >
              <View style={styles.menuContent}>
                {FORMAT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.menuItem}
                    onPress={() => {
                      setFormatType(option.value as FormatType);
                      setShowFormatMenu(false);
                    }}
                  >
                    <Text style={styles.menuItemText}>
                      {t(option.labelKey)}
                    </Text>
                    {formatType === option.value && (
                      <Ionicons name="checkmark" size={18} color={themeColors.textPrimary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={showExportMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowExportMenu(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowExportMenu(false)}
            >
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t('editor.exportTitle')}</Text>
                <TouchableOpacity style={styles.menuItem} onPress={handleExportText}>
                  <Text style={styles.menuItemText}>{t('editor.exportCopy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleExportImage}>
                  <Text style={styles.menuItemText}>{t('editor.exportWeibo')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleExportImage}>
                  <Text style={styles.menuItemText}>{t('editor.exportImage')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleExportPDF}>
                  <Text style={styles.menuItemText}>{t('editor.exportMail')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleExportPDF}>
                  <Text style={styles.menuItemText}>{t('editor.exportKnowledge')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={showImageActions}
            transparent
            animationType="fade"
            onRequestClose={() => setShowImageActions(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowImageActions(false)}
            >
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t('editor.imageActions')}</Text>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    handleCropImage();
                    setShowImageActions(false);
                  }}
                >
                  <Text style={styles.menuItemText}>{t('editor.imageCrop')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    if (activeImage) {
                      handleRemoveImage(activeImage.id);
                    }
                    setShowImageActions(false);
                  }}
                >
                  <Text style={styles.menuItemText}>{t('editor.imageDelete')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    handleSaveImageToAlbum();
                    setShowImageActions(false);
                  }}
                >
                  <Text style={styles.menuItemText}>{t('editor.imageSave')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowImageActions(false);
                    setShowImagePreview(true);
                  }}
                >
                  <Text style={styles.menuItemText}>{t('editor.imagePreview')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={showImagePreview}
            transparent
            animationType="fade"
            onRequestClose={() => setShowImagePreview(false)}
          >
            <View style={styles.previewOverlay}>
              <TouchableOpacity
                style={styles.previewClose}
                onPress={() => setShowImagePreview(false)}
              >
                <Ionicons name="close" size={24} color={themeColors.paperWhite} />
              </TouchableOpacity>
              {activeImage && (
                <View style={styles.previewImageContainer}>
                  <Image
                    source={{ uri: activeImage.uri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  {activeImage.caption ? (
                    <Text style={styles.previewCaption}>{activeImage.caption}</Text>
                  ) : null}
                </View>
              )}
            </View>
          </Modal>
        </KeyboardAvoidingView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  aiChip: {
    backgroundColor: colors.paperWhite,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  aiText: {
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    backgroundColor: colors.paperWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.paperLine,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: colors.paperYellow,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  folderChipText: {
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    color: colors.textSecondary,
  },
  metaText: {
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.regular,
    color: colors.textSecondary,
  },
  metaDivider: {
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.regular,
    color: colors.textPlaceholder,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: colors.paperYellow,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  formatChipText: {
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    color: colors.textSecondary,
  },
  editorContainer: {
    flex: 1,
  },
  editorContent: {
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
  titleInput: {
    fontFamily: FONTS.display,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.md,
    padding: 0,
  },
  contentInput: {
    fontFamily: FONTS.regular,
    color: colors.textPrimary,
    minHeight: 200,
    padding: 0,
  },
  richEditor: {
    minHeight: 280,
  },
  previewContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: colors.paperLine,
  },
  previewLabel: {
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    color: colors.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: colors.paperWhite,
    borderTopWidth: 1,
    borderTopColor: colors.paperLine,
    gap: SPACING.sm,
  },
  toolbarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: colors.paperYellow,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  toolbarLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: colors.toolbarIcon,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  menuContent: {
    backgroundColor: colors.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    minWidth: 220,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  menuTitle: {
    fontSize: FONT_SIZES.medium,
    fontFamily: FONTS.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemText: {
    fontSize: FONT_SIZES.medium,
    fontFamily: FONTS.medium,
    color: colors.textPrimary,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  previewClose: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 2,
  },
  previewImageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 320,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: colors.woodDark,
  },
  previewCaption: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.medium,
    fontFamily: FONTS.medium,
    color: colors.paperWhite,
    textAlign: 'center',
  },
});

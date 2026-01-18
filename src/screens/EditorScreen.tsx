import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import Markdown from 'react-native-markdown-display';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import { useNoteStore } from '../store/noteStore';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  FORMAT_OPTIONS,
} from '../constants/theme';
import { FormatType, NoteImage } from '../types';

interface EditorScreenProps {
  navigation: any;
  route: any;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  navigation,
  route,
}) => {
  const { noteId } = route.params || {};
  const { notes, addNote, updateNote, deleteNote, toggleFavorite, folders } =
    useNoteStore();

  const existingNote = noteId ? notes.find((n) => n.id === noteId) : null;

  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [formatType, setFormatType] = useState<FormatType>(
    existingNote?.formatType || 'plain'
  );
  const [images, setImages] = useState<NoteImage[]>(
    existingNote?.images || []
  );
  const [isFavorite, setIsFavorite] = useState(
    existingNote?.isFavorite || false
  );
  const [folderId, setFolderId] = useState<string | null>(
    existingNote?.folderId || null
  );

  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const contentRef = React.useRef<View>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const handleSave = () => {
    if (noteId) {
      updateNote(noteId, {
        title,
        content,
        formatType,
        images,
        isFavorite,
        folderId,
      });
    } else {
      addNote({
        title,
        content,
        formatType,
        images,
        isFavorite,
        folderId,
      });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('删除笔记', '确定要删除这条笔记吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          if (noteId) {
            deleteNote(noteId);
          }
          navigation.goBack();
        },
      },
    ]);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (noteId) {
      toggleFavorite(noteId);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: NoteImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
      setImages([...images, newImage]);
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleExportText = async () => {
    await Clipboard.setStringAsync(content);
    Alert.alert('成功', '文字已复制到剪贴板');
    setShowExportMenu(false);
  };

  const handleExportImage = async () => {
    try {
      if (contentRef.current) {
        const uri = await captureRef(contentRef, {
          format: 'png',
          quality: 1,
        });
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert('错误', '导出图片失败');
    }
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #2C2416; }
              p { color: #6B5D4F; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${title || '无标题'}</h1>
            <p>${content.replace(/\n/g, '<br>')}</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('错误', '导出PDF失败');
    }
    setShowExportMenu(false);
  };

  const insertFormatting = (format: string) => {
    let newContent = content;
    switch (format) {
      case 'heading':
        newContent += '\n# 标题\n';
        break;
      case 'bold':
        newContent += '**粗体**';
        break;
      case 'list':
        newContent += '\n- 列表项\n';
        break;
      case 'quote':
        newContent += '\n> 引用\n';
        break;
      case 'todo':
        newContent += '\n- [ ] 待办事项\n';
        break;
      case 'center':
        newContent += '\n<center>居中文本</center>\n';
        break;
    }
    setContent(newContent);
  };

  const renderContent = () => {
    if (formatType === 'markdown') {
      return (
        <Markdown style={markdownStyles}>{content || '开始输入...'}</Markdown>
      );
    }
    return (
      <TextInput
        style={styles.contentInput}
        value={content}
        onChangeText={setContent}
        placeholder="开始输入..."
        placeholderTextColor={COLORS.textPlaceholder}
        multiline
        textAlignVertical="top"
      />
    );
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* 头部工具栏 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <TouchableOpacity onPress={() => setShowFormatMenu(true)}>
                <Text style={styles.formatButton}>
                  {FORMAT_OPTIONS.find((opt) => opt.value === formatType)
                    ?.label || '无'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleToggleFavorite}>
                <Text style={styles.headerIcon}>
                  {isFavorite ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
              {noteId && (
                <TouchableOpacity onPress={handleDelete}>
                  <Text style={styles.headerIcon}>🗑️</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowExportMenu(true)}>
                <Text style={styles.headerIcon}>↗️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 编辑区域 */}
          <ScrollView style={styles.editorContainer}>
            <View ref={contentRef} style={styles.editorContent}>
              <PaperCard>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="标题"
                  placeholderTextColor={COLORS.textPlaceholder}
                />

                {renderContent()}

                {/* 图片列表 */}
                {images.map((image) => (
                  <View key={image.id} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.imageRemove}
                      onPress={() => handleRemoveImage(image.id)}
                    >
                      <Text style={styles.imageRemoveText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </PaperCard>
            </View>
          </ScrollView>

          {/* 底部工具栏 */}
          <View style={styles.bottomToolbar}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => setShowToolbar(!showToolbar)}
            >
              <Text style={styles.toolbarButtonText}>AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handlePickImage}
            >
              <Text style={styles.toolbarButtonText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleSave}
            >
              <Text style={styles.toolbarButtonText}>✓</Text>
            </TouchableOpacity>
          </View>

          {/* 快捷工具栏 */}
          {showToolbar && (
            <View style={styles.quickToolbar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => insertFormatting('heading')}
                >
                  <Text style={styles.quickButtonText}>标题</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => insertFormatting('center')}
                >
                  <Text style={styles.quickButtonText}>居中</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => insertFormatting('list')}
                >
                  <Text style={styles.quickButtonText}>列表</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => insertFormatting('bold')}
                >
                  <Text style={styles.quickButtonText}>粗体</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => insertFormatting('quote')}
                >
                  <Text style={styles.quickButtonText}>引用</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => insertFormatting('todo')}
                >
                  <Text style={styles.quickButtonText}>待办</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* 格式选择模态框 */}
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
                    style={[
                      styles.menuItem,
                      formatType === option.value && styles.menuItemSelected,
                    ]}
                    onPress={() => {
                      setFormatType(option.value as FormatType);
                      setShowFormatMenu(false);
                    }}
                  >
                    <Text style={styles.menuItemText}>{option.label}</Text>
                    {formatType === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* 导出选项模态框 */}
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
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleExportText}
                >
                  <Text style={styles.menuItemText}>复制文字</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleExportImage}
                >
                  <Text style={styles.menuItemText}>分享新浪长图微博</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleExportImage}
                >
                  <Text style={styles.menuItemText}>以图片形式分享</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleExportPDF}
                >
                  <Text style={styles.menuItemText}>发送邮件</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleExportPDF}
                >
                  <Text style={styles.menuItemText}>输入到我的印象</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </KeyboardAvoidingView>
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
    marginHorizontal: SPACING.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  formatButton: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.paperWhite,
    borderRadius: BORDER_RADIUS.md,
  },
  headerRight: {
    flexDirection: 'row',
  },
  editorContainer: {
    flex: 1,
  },
  editorContent: {
    padding: SPACING.lg,
  },
  titleInput: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    padding: 0,
  },
  contentInput: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 200,
    padding: 0,
  },
  imageContainer: {
    marginTop: SPACING.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
  },
  imageRemove: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.delete,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoveText: {
    color: COLORS.paperWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.woodLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.woodDark,
  },
  toolbarButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.paperWhite,
    borderRadius: BORDER_RADIUS.md,
  },
  toolbarButtonText: {
    fontSize: FONT_SIZES.large,
  },
  quickToolbar: {
    backgroundColor: COLORS.paperWhite,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.woodDark,
  },
  quickButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  quickButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.paperWhite,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    backgroundColor: COLORS.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemSelected: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
  },
  checkmark: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textPrimary,
  },
});

const markdownStyles = {
  body: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  heading1: {
    fontSize: FONT_SIZES.heading,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  heading2: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.paperWhite,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    paddingLeft: SPACING.md,
    paddingVertical: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  list_item: {
    marginVertical: SPACING.xs,
  },
};

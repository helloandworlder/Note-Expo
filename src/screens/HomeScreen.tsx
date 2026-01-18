import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import { useNoteStore } from '../store/noteStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Note, Folder } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    notes,
    folders,
    searchQuery,
    setSearchQuery,
    addFolder,
    deleteFolder,
    loadData,
  } = useNoteStore();

  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // 过滤笔记
  const filteredNotes = notes.filter((note) => {
    // 文件夹过滤
    if (selectedFolder === 'all') {
      // 显示所有笔记
    } else if (selectedFolder === 'favorites') {
      if (!note.isFavorite) return false;
    } else {
      if (note.folderId !== selectedFolder) return false;
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderModal(false);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    Alert.alert('删除文件夹', '确定要删除这个文件夹吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deleteFolder(folderId),
      },
    ]);
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Editor', { noteId: item.id })}
    >
      <PaperCard style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteDate}>
            {new Date(item.updatedAt).toLocaleDateString('zh-CN')}
          </Text>
          {item.isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
        </View>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || '无标题'}
        </Text>
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content || '空白笔记'}
        </Text>
      </PaperCard>
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }: { item: Folder }) => {
    const isSelected = selectedFolder === item.id;
    const noteCount = notes.filter((note) =>
      item.id === 'all'
        ? true
        : item.id === 'favorites'
        ? note.isFavorite
        : note.folderId === item.id
    ).length;

    return (
      <TouchableOpacity
        style={[styles.folderItem, isSelected && styles.folderItemSelected]}
        onPress={() => setSelectedFolder(item.id)}
        onLongPress={() => {
          if (item.id !== 'all' && item.id !== 'favorites') {
            handleDeleteFolder(item.id);
          }
        }}
      >
        <Text style={styles.folderIcon}>
          {item.id === 'favorites' ? '⭐' : '📁'}
        </Text>
        <Text style={styles.folderName}>{item.name}</Text>
        <Text style={styles.folderCount}>{noteCount}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>全部便签</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowFolderModal(true)}>
              <Text style={styles.headerIcon}>📁+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Editor', { noteId: null })}
            >
              <Text style={styles.headerIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 搜索栏 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索笔记..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 文件夹列表 */}
        <View style={styles.foldersContainer}>
          <FlatList
            horizontal
            data={folders}
            renderItem={renderFolderItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.foldersList}
          />
        </View>

        {/* 笔记列表 */}
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无笔记</Text>
              <Text style={styles.emptyHint}>点击右上角 ✏️ 创建新笔记</Text>
            </View>
          }
        />

        {/* 添加文件夹模态框 */}
        <Modal
          visible={showFolderModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFolderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>新建文件夹</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="文件夹名称"
                placeholderTextColor={COLORS.textPlaceholder}
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowFolderModal(false);
                    setNewFolderName('');
                  }}
                >
                  <Text style={styles.modalButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddFolder}
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
    marginHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foldersContainer: {
    paddingBottom: SPACING.md,
  },
  foldersList: {
    paddingHorizontal: SPACING.lg,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.paperWhite,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  folderItemSelected: {
    backgroundColor: COLORS.accent,
  },
  folderIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  folderName: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  folderCount: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  notesList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  noteCard: {
    marginBottom: SPACING.md,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  noteDate: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  noteTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  noteContent: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptyHint: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPlaceholder,
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
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

import React, { useEffect, useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { WoodBackground } from '../components/common/WoodBackground';
import { PaperCard } from '../components/common/PaperCard';
import { useNoteStore } from '../store/noteStore';
import {
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  ThemeColors,
  getThemeColors,
} from '../constants/theme';
import { Folder, Note } from '../types';
import { formatDate, t } from '../utils/i18n';

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
    settings,
  } = useNoteStore();

  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const themeColors = useMemo(
    () => getThemeColors(settings.appearance),
    [settings.appearance]
  );
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const getFolderName = (folder: Folder) => {
    if (folder.id === 'all') return t('home.folderAll');
    if (folder.id === 'favorites') return t('home.folderFavorites');
    return folder.name;
  };

  const getNoteCount = (folderId: string) =>
    notes.filter((note) =>
      folderId === 'all'
        ? true
        : folderId === 'favorites'
        ? note.isFavorite
        : note.folderId === folderId
    ).length;

  const filteredNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      if (selectedFolder === 'favorites' && !note.isFavorite) return false;
      if (selectedFolder !== 'all' && selectedFolder !== 'favorites') {
        if (note.folderId !== selectedFolder) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        );
      }

      return true;
    });

    return filtered.sort((a, b) => {
      switch (settings.noteSort) {
        case 'updated-asc':
          return a.updatedAt - b.updatedAt;
        case 'created-desc':
          return b.createdAt - a.createdAt;
        case 'created-asc':
          return a.createdAt - b.createdAt;
        case 'updated-desc':
        default:
          return b.updatedAt - a.updatedAt;
      }
    });
  }, [notes, searchQuery, selectedFolder, settings.noteSort]);

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    Alert.alert(t('home.deleteFolderTitle'), t('home.deleteFolderMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteFolder(folderId),
      },
    ]);
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Editor', { noteId: item.id })}
    >
      <PaperCard
        style={styles.noteCard}
        contentStyle={styles.noteCardContent}
        appearance={settings.appearance}
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
          {item.isFavorite && (
            <Ionicons name="star" size={14} color={themeColors.favorite} />
          )}
        </View>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || t('note.untitled')}
        </Text>
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content || t('note.empty')}
        </Text>
      </PaperCard>
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }: { item: Folder }) => {
    const isSelected = selectedFolder === item.id;
    return (
      <TouchableOpacity
        style={[styles.folderItem, isSelected && styles.folderItemSelected]}
        onPress={() => {
          setSelectedFolder(item.id);
          setShowFolderMenu(false);
        }}
        onLongPress={() => {
          if (item.id !== 'all' && item.id !== 'favorites') {
            handleDeleteFolder(item.id);
          }
        }}
      >
        <View style={styles.folderItemLeft}>
          <Ionicons
            name={item.id === 'favorites' ? 'star' : 'folder'}
            size={16}
            color={themeColors.textPrimary}
          />
          <Text style={styles.folderName}>{getFolderName(item)}</Text>
        </View>
        <View style={styles.folderItemRight}>
          <Text style={styles.folderCount}>{getNoteCount(item.id)}</Text>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={themeColors.accent} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const selectedFolderName = getFolderName(
    folders.find((folder) => folder.id === selectedFolder) || {
      id: 'all',
      name: t('home.folderAll'),
      createdAt: Date.now(),
    }
  );

  return (
    <WoodBackground variant={settings.appearance}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('home.titleAll')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowFolderMenu(true)}>
              <Ionicons name="folder-open" size={22} color={themeColors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Editor', { noteId: null })}
            >
              <Ionicons name="create" size={22} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={16}
            color={themeColors.textPlaceholder}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={themeColors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.folderSelector}
          accessibilityLabel="folder-selector"
          onPress={() => setShowFolderMenu(true)}
        >
          <View style={styles.folderSelectorLeft}>
            <Ionicons name="folder" size={16} color={themeColors.textSecondary} />
            <Text style={styles.folderSelectorText}>{selectedFolderName}</Text>
          </View>
          <View style={styles.folderSelectorRight}>
            <Text style={styles.folderSelectorCount}>
              {getNoteCount(selectedFolder)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={themeColors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('home.emptyTitle')}</Text>
              <Text style={styles.emptyHint}>{t('home.emptyHint')}</Text>
            </View>
          }
        />

        <Modal
          visible={showFolderMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFolderMenu(false)}
        >
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowFolderMenu(false)}
          >
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>{t('home.titleAll')}</Text>
                <View style={styles.menuActions}>
                  <TouchableOpacity style={styles.menuActionChip}>
                    <Text style={styles.menuActionText}>AI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuActionChip}
                    onPress={() => {
                      setShowFolderMenu(false);
                      setShowNewFolderModal(true);
                    }}
                  >
                    <Ionicons name="add" size={16} color={themeColors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
              <FlatList
                data={folders}
                renderItem={renderFolderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showNewFolderModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNewFolderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('home.addFolderTitle')}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t('home.folderPlaceholder')}
                placeholderTextColor={themeColors.textPlaceholder}
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                  }}
                >
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddFolder}
                >
                  <Text style={styles.modalButtonText}>{t('common.confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: colors.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: colors.textPrimary,
  },
  folderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paperWhite,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.woodLight,
  },
  folderSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  folderSelectorText: {
    fontSize: FONT_SIZES.medium,
    color: colors.textPrimary,
  },
  folderSelectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  folderSelectorCount: {
    fontSize: FONT_SIZES.small,
    color: colors.textSecondary,
  },
  notesList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  noteCard: {
    marginBottom: SPACING.md,
  },
  noteCardContent: {
    paddingVertical: SPACING.md,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  noteDate: {
    fontSize: FONT_SIZES.small,
    color: colors.textSecondary,
  },
  noteTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.xs,
  },
  noteContent: {
    fontSize: FONT_SIZES.medium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    color: colors.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptyHint: {
    fontSize: FONT_SIZES.medium,
    color: colors.textPlaceholder,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingTop: 140,
    paddingHorizontal: SPACING.lg,
  },
  menuContent: {
    backgroundColor: colors.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  menuTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  menuActionChip: {
    backgroundColor: colors.paperYellow,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuActionText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  folderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  folderItemSelected: {
    backgroundColor: colors.paperYellow,
  },
  folderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  folderName: {
    fontSize: FONT_SIZES.medium,
    color: colors.textPrimary,
  },
  folderItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  folderCount: {
    fontSize: FONT_SIZES.small,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.paperWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.paperYellow,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.medium,
    color: colors.textPrimary,
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
    backgroundColor: colors.textPlaceholder,
  },
  modalButtonConfirm: {
    backgroundColor: colors.accent,
  },
  modalButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.paperWhite,
  },
});

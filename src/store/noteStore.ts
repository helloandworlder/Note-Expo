import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, Folder, Note } from '../types';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: '全部便签', createdAt: Date.now() },
  { id: 'favorites', name: '加星便签', createdAt: Date.now() },
];

export const DEFAULT_SETTINGS: AppSettings = {
  shareFooterEnabled: true,
  shareFooterText: 'SynexIM · {time}',
  defaultFormatType: 'rtf',
  fontSize: 'medium',
  appearance: 'linen',
  noteSort: 'updated-desc',
};

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  searchQuery: string;
  settings: AppSettings;

  // 笔记操作
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  toggleFavorite: (id: string) => void;

  // 文件夹操作
  addFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  // 搜索
  setSearchQuery: (query: string) => void;

  // 设置
  updateSettings: (updates: Partial<AppSettings>) => void;

  // 数据持久化
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  folders: DEFAULT_FOLDERS.map((folder) => ({ ...folder })),
  currentNote: null,
  searchQuery: '',
  settings: { ...DEFAULT_SETTINGS },

  addNote: (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      content: noteData.content || '',
      richContent: noteData.richContent || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ notes: [newNote, ...state.notes] }));
    get().saveData();
    return newNote.id;
  },

  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      ),
    }));
    get().saveData();
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNote: state.currentNote?.id === id ? null : state.currentNote,
    }));
    get().saveData();
  },

  setCurrentNote: (note) => {
    set({ currentNote: note });
  },

  toggleFavorite: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
      ),
    }));
    get().saveData();
  },

  addFolder: (name) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
    };
    set((state) => ({ folders: [...state.folders, newFolder] }));
    get().saveData();
  },

  updateFolder: (id, name) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, name } : folder
      ),
    }));
    get().saveData();
  },

  deleteFolder: (id) => {
    // 删除文件夹时，将该文件夹下的笔记移到"全部便签"
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      notes: state.notes.map((note) =>
        note.folderId === id ? { ...note, folderId: null } : note
      ),
    }));
    get().saveData();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  updateSettings: (updates) => {
    set((state) => ({ settings: { ...state.settings, ...updates } }));
    get().saveData();
  },

  loadData: async () => {
    try {
      const notesData = await AsyncStorage.getItem('notes');
      const foldersData = await AsyncStorage.getItem('folders');
      const settingsData = await AsyncStorage.getItem('settings');

      if (notesData) {
        set({ notes: JSON.parse(notesData) });
      }

      if (foldersData) {
        const parsedFolders = JSON.parse(foldersData) as Folder[];
        const hasAll = parsedFolders.some((folder) => folder.id === 'all');
        const hasFavorites = parsedFolders.some(
          (folder) => folder.id === 'favorites'
        );
        const nextFolders = [...parsedFolders];

        if (!hasAll) {
          nextFolders.unshift({ ...DEFAULT_FOLDERS[0] });
        }
        if (!hasFavorites) {
          nextFolders.splice(hasAll ? 1 : 2, 0, { ...DEFAULT_FOLDERS[1] });
        }

        set({ folders: nextFolders });
      } else {
        set({ folders: DEFAULT_FOLDERS.map((folder) => ({ ...folder })) });
      }

      if (settingsData) {
        set({ settings: { ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) } });
      } else {
        set({ settings: { ...DEFAULT_SETTINGS } });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  },

  saveData: async () => {
    try {
      const { notes, folders, settings } = get();
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
      await AsyncStorage.setItem('folders', JSON.stringify(folders));
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  },
}));

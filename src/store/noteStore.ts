import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, Folder } from '../types';

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  searchQuery: string;

  // 笔记操作
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
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

  // 数据持久化
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  folders: [
    { id: 'all', name: '全部便签', createdAt: Date.now() },
    { id: 'favorites', name: '加星便签', createdAt: Date.now() },
  ],
  currentNote: null,
  searchQuery: '',

  addNote: (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ notes: [newNote, ...state.notes] }));
    get().saveData();
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

  loadData: async () => {
    try {
      const notesData = await AsyncStorage.getItem('notes');
      const foldersData = await AsyncStorage.getItem('folders');

      if (notesData) {
        set({ notes: JSON.parse(notesData) });
      }

      if (foldersData) {
        set({ folders: JSON.parse(foldersData) });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  },

  saveData: async () => {
    try {
      const { notes, folders } = get();
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
      await AsyncStorage.setItem('folders', JSON.stringify(folders));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  },
}));

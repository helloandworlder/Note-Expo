import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useNoteStore,
  DEFAULT_FOLDERS,
  DEFAULT_SETTINGS,
} from '../src/store/noteStore';

const resetStore = () => {
  AsyncStorage.clear();
  useNoteStore.setState({
    notes: [],
    folders: DEFAULT_FOLDERS,
    currentNote: null,
    searchQuery: '',
    settings: DEFAULT_SETTINGS,
  });
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('noteStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('adds note and persists data', async () => {
    const { addNote } = useNoteStore.getState();
    const noteId = addNote({
      title: '测试笔记',
      content: '内容',
      richContent: '',
      folderId: null,
      formatType: 'plain',
      isFavorite: false,
      images: [],
    });

    expect(noteId).toBeTruthy();
    const { notes } = useNoteStore.getState();
    expect(notes[0].id).toBe(noteId);

    await flushPromises();
    const storedNotes = await AsyncStorage.getItem('notes');
    expect(storedNotes).toContain('测试笔记');
  });

  it('updates settings and restores from storage', async () => {
    const { updateSettings } = useNoteStore.getState();
    updateSettings({
      defaultFormatType: 'markdown',
      shareFooterText: 'SynexIM · {time}',
    });

    await flushPromises();
    const storedSettings = await AsyncStorage.getItem('settings');
    expect(JSON.parse(storedSettings || '{}').defaultFormatType).toBe('markdown');

    useNoteStore.setState({
      notes: [],
      folders: DEFAULT_FOLDERS,
      currentNote: null,
      searchQuery: '',
      settings: DEFAULT_SETTINGS,
    });

    await useNoteStore.getState().loadData();
    expect(useNoteStore.getState().settings.defaultFormatType).toBe('markdown');
  });
});

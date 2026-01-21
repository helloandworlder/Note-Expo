import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EditorScreen } from '../src/screens/EditorScreen';
import { useNoteStore } from '../src/store/noteStore';
import { Note } from '../src/types';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
const MockRichTextEditor = () => null;
MockRichTextEditor.displayName = 'MockRichTextEditor';

const MockImageWithCaption = () => null;
MockImageWithCaption.displayName = 'MockImageWithCaption';

jest.mock('../src/components/editor/RichTextEditor', () => ({
  RichTextEditor: MockRichTextEditor,
}));
jest.mock('../src/components/editor/ImageWithCaption', () => ({
  ImageWithCaption: MockImageWithCaption,
}));

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

const navigation = {
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('EditorScreen', () => {
  beforeEach(() => {
    navigation.goBack.mockClear();
    const state = useNoteStore.getState();
    useNoteStore.setState(
      {
        ...state,
        notes: [],
        settings: { ...state.settings, defaultFormatType: 'plain' },
      },
      true
    );
  });

  it('saves a new note and navigates back', async () => {
    const { getByPlaceholderText, getByLabelText } = render(
      <EditorScreen navigation={navigation} route={{ params: { noteId: null } }} />
    );

    fireEvent.changeText(getByPlaceholderText('标题'), '新笔记');
    fireEvent.changeText(getByPlaceholderText('开始输入...'), '正文');
    fireEvent.press(getByLabelText('save-note'));

    await waitFor(() => {
      const { notes } = useNoteStore.getState();
      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe('新笔记');
      expect(notes[0].content).toBe('正文');
    });

    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('toggles favorite on existing note', async () => {
    const existingNote: Note = {
      id: 'note-1',
      title: '旧笔记',
      content: '旧内容',
      richContent: '',
      folderId: null,
      formatType: 'plain',
      isFavorite: false,
      images: [],
      createdAt: 0,
      updatedAt: 0,
    };

    useNoteStore.setState({ notes: [existingNote] });

    const { getByLabelText } = render(
      <EditorScreen navigation={navigation} route={{ params: { noteId: 'note-1' } }} />
    );

    fireEvent.press(getByLabelText('toggle-favorite'));

    await waitFor(() => {
      const note = useNoteStore.getState().notes[0];
      expect(note.isFavorite).toBe(true);
    });
  });
});

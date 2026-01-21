import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../src/screens/HomeScreen';
import { useNoteStore } from '../src/store/noteStore';
import { Folder, Note } from '../src/types';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

const navigation = {
  navigate: jest.fn(),
};

const folders: Folder[] = [
  { id: 'all', name: '全部便签', createdAt: 0 },
  { id: 'favorites', name: '加星便签', createdAt: 0 },
  { id: 'work', name: '工作', createdAt: 0 },
];

const notes: Note[] = [
  {
    id: 'note-1',
    title: '第一条',
    content: '内容A',
    richContent: '',
    folderId: null,
    formatType: 'plain',
    isFavorite: true,
    images: [],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'note-2',
    title: '第二条',
    content: '内容B',
    richContent: '',
    folderId: 'work',
    formatType: 'plain',
    isFavorite: false,
    images: [],
    createdAt: 0,
    updatedAt: 0,
  },
];

describe('HomeScreen', () => {
  beforeEach(() => {
    navigation.navigate.mockClear();
    useNoteStore.setState({
      notes,
      folders,
      searchQuery: '',
      loadData: jest.fn(),
    });
  });

  it('filters notes by search query', () => {
    const { getByPlaceholderText, queryByText } = render(
      <HomeScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('搜索便签...'), '第一');

    expect(queryByText('第一条')).toBeTruthy();
    expect(queryByText('第二条')).toBeNull();
  });

  it('filters notes by folder selection', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <HomeScreen navigation={navigation} />
    );

    fireEvent.press(getByLabelText('folder-selector'));
    fireEvent.press(getByText('加星便签'));

    expect(queryByText('第一条')).toBeTruthy();
    expect(queryByText('第二条')).toBeNull();
  });

  it('navigates to editor when note is pressed', () => {
    const { getByText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByText('第一条'));

    expect(navigation.navigate).toHaveBeenCalledWith('Editor', {
      noteId: 'note-1',
    });
  });
});

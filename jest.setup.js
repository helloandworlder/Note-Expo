require('@testing-library/jest-native/extend-expect');
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), {
  virtual: true,
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'zh-CN' }],
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const createIcon = (name) => (props) => (
    <Text {...props}>{name}</Text>
  );

  return {
    Ionicons: createIcon('Ionicons'),
    MaterialCommunityIcons: createIcon('Material'),
  };
});

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file://mock/',
  cacheDirectory: 'file://mock/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));

jest.mock('react-native-pell-rich-editor', () => ({
  actions: {
    heading1: 'heading1',
    alignCenter: 'justifyCenter',
    insertBulletsList: 'unorderedList',
    setBold: 'bold',
    blockquote: 'quote',
    checkboxList: 'checkboxList',
  },
  RichEditor: () => null,
  RichToolbar: () => null,
}));

jest.mock('react-native-markdown-display', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const Markdown = ({ children }) => <Text>{children}</Text>;
  Markdown.displayName = 'Markdown';
  return Markdown;
});

jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  const { View } = require('react-native');

  const FlatList = ({ data = [], renderItem, keyExtractor, ...props }) => (
    <View {...props}>
      {data.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : String(index);
        return (
          <React.Fragment key={key}>
            {renderItem({ item, index })}
          </React.Fragment>
        );
      })}
    </View>
  );

  return {
    __esModule: true,
    default: FlatList,
  };
});

const { Image } = require('react-native');
if (Image) {
  Object.defineProperty(Image, 'getSize', {
    value: jest.fn((uri, success, failure) => {
      if (typeof success === 'function') {
        success(320, 240);
      } else if (typeof failure === 'function') {
        failure(new Error('Invalid image callback'));
      }
    }),
  });
}

import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  forwardRef,
  useMemo,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import { ThemeColors, getThemeColors } from '../../constants/theme';
import { AppearanceType } from '../../types';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  style?: any;
  fontSize?: number;
  placeholder?: string;
  appearance?: AppearanceType;
}

export interface RichTextEditorHandle {
  undo: () => void;
  redo: () => void;
  applyAction: (action: actions) => void;
  insertImage: (uri: string) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (
    { initialContent, onChange, style, fontSize = 16, placeholder, appearance },
    ref
  ) => {
    const richText = useRef<RichEditor>(null);
    const themeColors = useMemo(
      () => getThemeColors(appearance || 'linen'),
      [appearance]
    );
    const styles = useMemo(() => createStyles(themeColors), [themeColors]);

    const customCSS = `
      * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      body {
        background-color: ${themeColors.paper};
        color: ${themeColors.text};
        padding: 16px;
        font-size: ${fontSize}px;
        line-height: 1.6;
      }
      h1 {
        font-size: ${fontSize * 1.6}px;
        font-weight: bold;
        margin: 16px 0 8px 0;
        color: ${themeColors.text};
      }
      h2 {
        font-size: ${fontSize * 1.4}px;
        font-weight: bold;
        margin: 14px 0 7px 0;
        color: ${themeColors.text};
      }
      h3 {
        font-size: ${fontSize * 1.2}px;
        font-weight: bold;
        margin: 12px 0 6px 0;
        color: ${themeColors.text};
      }
      p {
        margin: 8px 0;
      }
      blockquote {
        border-left: 4px solid ${themeColors.primary};
        padding-left: 16px;
        margin: 12px 0;
        color: ${themeColors.textSecondary};
        font-style: italic;
      }
      ul, ol {
        padding-left: 24px;
        margin: 8px 0;
      }
      li {
        margin: 4px 0;
      }
      strong {
        font-weight: bold;
      }
      em {
        font-style: italic;
      }
      a {
        color: ${themeColors.primary};
        text-decoration: underline;
      }
    `;

    const handleContentChange = useCallback(
      (html: string) => {
        onChange(html);
      },
      [onChange]
    );

    useImperativeHandle(ref, () => ({
      undo: () => {
        richText.current?.command('undo');
      },
      redo: () => {
        richText.current?.command('redo');
      },
      applyAction: (action) => {
        richText.current?.sendAction(action, 'result');
      },
      insertImage: (uri) => {
        richText.current?.insertImage({ src: uri, alt: 'image' });
      },
    }));

    return (
      <View style={[styles.container, style]}>
        <RichEditor
          ref={richText}
          initialContentHTML={initialContent}
          onChange={handleContentChange}
          placeholder={placeholder}
          style={styles.editor}
          editorStyle={{
            backgroundColor: themeColors.paper,
            color: themeColors.text,
            placeholderColor: themeColors.textSecondary,
            contentCSSText: customCSS,
          }}
        />
      </View>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.paper,
    },
    editor: {
      minHeight: 300,
      backgroundColor: colors.paper,
    },
  });

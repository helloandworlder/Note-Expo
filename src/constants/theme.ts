import { Appearance, ColorSchemeName, Platform } from 'react-native';
import type { AppearanceType } from '../types';

interface BaseThemeColors {
  woodBackground: string;
  woodLight: string;
  woodDark: string;
  paperWhite: string;
  paperYellow: string;
  paperLine: string;
  paperLineStrong: string;
  textPrimary: string;
  textSecondary: string;
  textPlaceholder: string;
  accent: string;
  accentDark: string;
  favorite: string;
  delete: string;
  toolbarBackground: string;
  toolbarIcon: string;
  toolbarActive: string;
  shadow: string;
  shadowDark: string;
}

export interface ThemeColors extends BaseThemeColors {
  background: string;
  paper: string;
  text: string;
  primary: string;
  border: string;
  error: string;
}

const buildTheme = (theme: BaseThemeColors): ThemeColors => ({
  ...theme,
  background: theme.woodBackground,
  paper: theme.paperWhite,
  text: theme.textPrimary,
  primary: theme.accent,
  border: theme.woodLight,
  error: theme.delete,
});

const MINIMAL_THEME = buildTheme({
  woodBackground: '#F3F1EC',
  woodLight: '#ECE7E0',
  woodDark: '#DFD8CE',
  paperWhite: '#FCFBF9',
  paperYellow: '#F6F3EE',
  paperLine: '#E3DED6',
  paperLineStrong: '#D6CEC4',
  textPrimary: '#2D2B28',
  textSecondary: '#6E6861',
  textPlaceholder: '#A59E96',
  accent: '#6C8C85',
  accentDark: '#54736D',
  favorite: '#E0A24D',
  delete: '#D1766A',
  toolbarBackground: '#F2EEE8',
  toolbarIcon: '#6E6861',
  toolbarActive: '#6C8C85',
  shadow: 'rgba(36, 32, 28, 0.12)',
  shadowDark: 'rgba(36, 32, 28, 0.2)',
});

const PAPER_THEME = buildTheme({
  woodBackground: '#EEE1CE',
  woodLight: '#F5E7D6',
  woodDark: '#E2CFB4',
  paperWhite: '#FFF8EE',
  paperYellow: '#FBEEDC',
  paperLine: '#E7D6C1',
  paperLineStrong: '#D9C7AF',
  textPrimary: '#3C3024',
  textSecondary: '#6C5A47',
  textPlaceholder: '#A08F7C',
  accent: '#C38755',
  accentDark: '#A26A3B',
  favorite: '#DEA256',
  delete: '#CC6C60',
  toolbarBackground: '#F2E0C9',
  toolbarIcon: '#755B44',
  toolbarActive: '#B67841',
  shadow: 'rgba(54, 40, 28, 0.14)',
  shadowDark: 'rgba(54, 40, 28, 0.22)',
});

const WOOD_THEME = buildTheme({
  woodBackground: '#D2AE84',
  woodLight: '#E1C7A4',
  woodDark: '#B3875E',
  paperWhite: '#FFF5E6',
  paperYellow: '#F5E2C8',
  paperLine: '#DEC6A8',
  paperLineStrong: '#CDB28F',
  textPrimary: '#3B2D1F',
  textSecondary: '#6C5848',
  textPlaceholder: '#A08F7F',
  accent: '#BE8143',
  accentDark: '#9A6530',
  favorite: '#DDA04F',
  delete: '#CE6A5F',
  toolbarBackground: '#E2BF99',
  toolbarIcon: '#6C533C',
  toolbarActive: '#B27439',
  shadow: 'rgba(46, 32, 22, 0.2)',
  shadowDark: 'rgba(46, 32, 22, 0.32)',
});

const DARK_THEME = buildTheme({
  woodBackground: '#141312',
  woodLight: '#1D1B1A',
  woodDark: '#0F0E0D',
  paperWhite: '#1A1918',
  paperYellow: '#1F1E1C',
  paperLine: '#2B2825',
  paperLineStrong: '#3B3631',
  textPrimary: '#F2EDE6',
  textSecondary: '#C9C1B8',
  textPlaceholder: '#8F8780',
  accent: '#7FA097',
  accentDark: '#5F7B74',
  favorite: '#E3B46B',
  delete: '#E0857A',
  toolbarBackground: '#171615',
  toolbarIcon: '#BDB4AA',
  toolbarActive: '#7FA097',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.55)',
});

export const THEME_COLORS: Partial<Record<AppearanceType, ThemeColors>> = {
  linen: MINIMAL_THEME,
  paper: PAPER_THEME,
  wood: WOOD_THEME,
  dark: DARK_THEME,
};

// 主题颜色（默认简约风）
export const COLORS = MINIMAL_THEME;

export const getThemeColors = (
  appearance: AppearanceType,
  colorScheme?: ColorSchemeName
): ThemeColors => {
  if (appearance === 'system') {
    const scheme = colorScheme || Appearance.getColorScheme();
    return scheme === 'dark' ? DARK_THEME : MINIMAL_THEME;
  }

  if (appearance === 'dark') {
    return DARK_THEME;
  }

  return THEME_COLORS[appearance] || MINIMAL_THEME;
};

// 字体大小
export const FONT_SIZES = {
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  title: 20,
  heading: 24,
};

// 字体缩放比例
export const FONT_SCALE = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

// 字体家族
export const FONTS = {
  regular: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    default: 'Avenir Next',
  }),
  medium: Platform.select({
    ios: 'Avenir Next Medium',
    android: 'sans-serif-medium',
    default: 'Avenir Next Medium',
  }),
  bold: Platform.select({
    ios: 'Avenir Next Demi Bold',
    android: 'sans-serif-medium',
    default: 'Avenir Next Demi Bold',
  }),
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
};

// 间距
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// 圆角
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

// 工具栏按钮配置
export const TOOLBAR_BUTTONS = [
  { id: 'heading', icon: 'text-height', label: '标题' },
  { id: 'center', icon: 'align-center', label: '居中' },
  { id: 'list', icon: 'list-ul', label: '列表' },
  { id: 'bold', icon: 'bold', label: '粗体' },
  { id: 'quote', icon: 'quote-left', label: '引用' },
  { id: 'todo', icon: 'check-square', label: '待办' },
];

// 格式类型选项
export const FORMAT_OPTIONS = [
  { value: 'plain', labelKey: 'format.plain' },
  { value: 'rtf', labelKey: 'format.rich' },
  { value: 'markdown', labelKey: 'format.markdown' },
];

// 导出选项
export const EXPORT_OPTIONS = [
  { id: 'copy', label: '复制文字', icon: 'copy' },
  { id: 'image', label: '分享新浪长图微博', icon: 'image' },
  { id: 'share', label: '以图片形式分享', icon: 'share' },
  { id: 'email', label: '发送邮件', icon: 'envelope' },
  { id: 'pdf', label: '输入到我的印象', icon: 'file-pdf' },
];

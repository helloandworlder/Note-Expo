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
  woodBackground: '#F4F2ED',
  woodLight: '#ECE8E2',
  woodDark: '#E1DBD2',
  paperWhite: '#FFFFFF',
  paperYellow: '#F7F5F0',
  paperLine: '#E6E0D7',
  paperLineStrong: '#DDD6CB',
  textPrimary: '#2B2723',
  textSecondary: '#6D6660',
  textPlaceholder: '#A29B93',
  accent: '#7B968A',
  accentDark: '#5E796E',
  favorite: '#E1A64A',
  delete: '#D3726A',
  toolbarBackground: '#F0ECE6',
  toolbarIcon: '#6D6660',
  toolbarActive: '#7B968A',
  shadow: 'rgba(32, 28, 24, 0.12)',
  shadowDark: 'rgba(32, 28, 24, 0.2)',
});

const PAPER_THEME = buildTheme({
  woodBackground: '#EFE4D2',
  woodLight: '#F6ECDD',
  woodDark: '#E3D1B8',
  paperWhite: '#FFF9F0',
  paperYellow: '#FFF2DD',
  paperLine: '#E6D4BC',
  paperLineStrong: '#D9C6AC',
  textPrimary: '#3A2F24',
  textSecondary: '#6B5A46',
  textPlaceholder: '#A6927E',
  accent: '#C58B4A',
  accentDark: '#A66F32',
  favorite: '#E0A256',
  delete: '#D16B61',
  toolbarBackground: '#F3E1C9',
  toolbarIcon: '#7A6047',
  toolbarActive: '#B97C3D',
  shadow: 'rgba(55, 42, 30, 0.12)',
  shadowDark: 'rgba(55, 42, 30, 0.2)',
});

const WOOD_THEME = buildTheme({
  woodBackground: '#D6B289',
  woodLight: '#E5CBA8',
  woodDark: '#B48B63',
  paperWhite: '#FFF7EA',
  paperYellow: '#F8E7D0',
  paperLine: '#E1CCB2',
  paperLineStrong: '#D2BA9B',
  textPrimary: '#3B2E21',
  textSecondary: '#6F5C4B',
  textPlaceholder: '#A39181',
  accent: '#C38E4E',
  accentDark: '#9E6E33',
  favorite: '#E2A351',
  delete: '#D06A60',
  toolbarBackground: '#E4C3A1',
  toolbarIcon: '#6E563F',
  toolbarActive: '#B57A3D',
  shadow: 'rgba(51, 38, 27, 0.18)',
  shadowDark: 'rgba(51, 38, 27, 0.28)',
});

export const THEME_COLORS: Record<AppearanceType, ThemeColors> = {
  linen: MINIMAL_THEME,
  paper: PAPER_THEME,
  wood: WOOD_THEME,
};

// 主题颜色（默认简约风）
export const COLORS = MINIMAL_THEME;

export const getThemeColors = (appearance: AppearanceType): ThemeColors =>
  THEME_COLORS[appearance] || MINIMAL_THEME;

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
  regular: 'System',
  medium: 'System',
  bold: 'System',
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

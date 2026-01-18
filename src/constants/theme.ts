// 主题颜色
export const COLORS = {
  // 拟物风格 - 木纹背景色
  woodBackground: '#D4B896',
  woodLight: '#E5D4B8',
  woodDark: '#B89968',

  // 纸张颜色
  paperWhite: '#FFFEF7',
  paperYellow: '#FFF9E6',

  // 文字颜色
  textPrimary: '#2C2416',
  textSecondary: '#6B5D4F',
  textPlaceholder: '#A89B8C',

  // 强调色
  accent: '#C9A86A',
  accentDark: '#A88B5A',

  // 功能色
  favorite: '#FFB84D',
  delete: '#D9534F',

  // 阴影
  shadow: 'rgba(0, 0, 0, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
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
  { value: 'plain', label: '无' },
  { value: 'rtf', label: '富文本模式' },
  { value: 'markdown', label: 'Markdown 模式' },
];

// 导出选项
export const EXPORT_OPTIONS = [
  { id: 'copy', label: '复制文字', icon: 'copy' },
  { id: 'image', label: '分享新浪长图微博', icon: 'image' },
  { id: 'share', label: '以图片形式分享', icon: 'share' },
  { id: 'email', label: '发送邮件', icon: 'envelope' },
  { id: 'pdf', label: '输入到我的印象', icon: 'file-pdf' },
];

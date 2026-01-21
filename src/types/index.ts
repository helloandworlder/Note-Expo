// 编辑器格式类型
export type FormatType = 'plain' | 'rtf' | 'markdown';

// 笔记类型定义
export interface Note {
  id: string;
  title: string;
  content: string;
  richContent?: string; // HTML 格式的富文本内容（RTF 模式使用）
  folderId: string | null;
  formatType: FormatType;
  isFavorite: boolean;
  images: NoteImage[];
  createdAt: number;
  updatedAt: number;
}

// 图片类型
export interface NoteImage {
  id: string;
  uri: string;
  caption?: string;
  width?: number;
  height?: number;
}

// 文件夹类型
export interface Folder {
  id: string;
  name: string;
  icon?: string;
  createdAt: number;
}

// 导出类型
export type ExportType = 'image' | 'text' | 'pdf';

// 工具栏按钮类型
export interface ToolbarButton {
  id: string;
  icon: string;
  label: string;
  action: () => void;
}

// 外观主题
export type AppearanceType = 'wood' | 'linen' | 'paper';

// 字体大小档位
export type FontSizeLevel = 'small' | 'medium' | 'large';

// 排序方式
export type NoteSortType =
  | 'updated-desc'
  | 'updated-asc'
  | 'created-desc'
  | 'created-asc';

// 应用设置
export interface AppSettings {
  shareFooterEnabled: boolean;
  shareFooterText: string;
  defaultFormatType: FormatType;
  fontSize: FontSizeLevel;
  appearance: AppearanceType;
  noteSort: NoteSortType;
}

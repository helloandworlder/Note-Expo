// 笔记类型定义
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  formatType: 'plain' | 'rtf' | 'markdown';
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

// 编辑器格式类型
export type FormatType = 'plain' | 'rtf' | 'markdown';

// 导出类型
export type ExportType = 'image' | 'text' | 'pdf';

// 工具栏按钮类型
export interface ToolbarButton {
  id: string;
  icon: string;
  label: string;
  action: () => void;
}

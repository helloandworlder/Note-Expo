/**
 * 内容转换工具
 * 用于在不同格式之间转换笔记内容
 */

/**
 * 将 HTML 转换为纯文本
 * 用于搜索和显示预览
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';

  return html
    // 移除所有 HTML 标签
    .replace(/<[^>]*>/g, '')
    // 替换 HTML 实体
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // 移除多余的空白
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * 将纯文本转换为 HTML
 * 保留换行符
 */
export const plainToHtml = (text: string): string => {
  if (!text) return '';

  return `<p>${text.replace(/\n/g, '<br>')}</p>`;
};

/**
 * 将 Markdown 转换为纯文本
 * 移除 Markdown 语法标记
 */
export const markdownToPlain = (markdown: string): string => {
  if (!markdown) return '';

  return markdown
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体和斜体
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 移除链接，保留文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除代码块标记
    .replace(/```[^`]*```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // 移除引用标记
    .replace(/^>\s+/gm, '')
    // 移除列表标记
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .trim();
};

/**
 * 清理 HTML 内容
 * 移除不安全的标签和属性
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // 移除不允许的标签（保留内容）
  let cleaned = html.replace(/<(\/?)(script|style|iframe|object|embed)[^>]*>/gi, '');

  // 移除事件处理器属性
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  return cleaned;
};

/**
 * 获取内容的纯文本版本
 * 根据格式类型自动选择转换方法
 */
export const getPlainText = (
  content: string,
  richContent: string | undefined,
  formatType: 'plain' | 'rtf' | 'markdown'
): string => {
  switch (formatType) {
    case 'rtf':
      return stripHtml(richContent || content);
    case 'markdown':
      return markdownToPlain(content);
    case 'plain':
    default:
      return content;
  }
};

import { formatDateTime } from './i18n';

export const formatShareFooter = (template: string, timestamp: number) => {
  const timeText = formatDateTime(timestamp);
  return template.replace('{time}', timeText);
};

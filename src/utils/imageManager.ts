/**
 * 图片管理工具
 * 用于保存、加载和清理图片文件
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';
import { NoteImage } from '../types';

// 图片存储目录
const IMAGES_DIR = `${
  FileSystem.documentDirectory || FileSystem.cacheDirectory || ''
}images/`;

/**
 * 确保图片目录存在
 */
const ensureImageDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
};

/**
 * 保存图片到本地目录
 * @param uri 图片的原始 URI（可能是临时文件）
 * @returns 保存后的本地 URI
 */
export const saveImageToLocal = async (uri: string): Promise<string> => {
  try {
    await ensureImageDirectory();

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}_${random}.${extension}`;
    const localUri = `${IMAGES_DIR}${filename}`;

    // 复制文件到本地目录
    await FileSystem.copyAsync({
      from: uri,
      to: localUri,
    });

    return localUri;
  } catch (error) {
    console.error('保存图片失败:', error);
    throw new Error('保存图片失败');
  }
};

/**
 * 删除本地图片文件
 * @param uri 图片的本地 URI
 */
export const deleteLocalImage = async (uri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error('删除图片失败:', error);
  }
};

/**
 * 获取图片尺寸
 * @param uri 图片 URI
 * @returns 图片的宽度和高度
 */
export const getImageSize = async (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width: number, height: number) => {
        resolve({ width, height });
      },
      (error: Error) => {
        console.error('获取图片尺寸失败:', error);
        reject(error);
      }
    );
  });
};

/**
 * 清理未使用的图片
 * @param usedImages 当前使用中的图片列表
 */
export const cleanupUnusedImages = async (usedImages: NoteImage[]): Promise<void> => {
  try {
    await ensureImageDirectory();

    // 获取所有本地图片文件
    const files = await FileSystem.readDirectoryAsync(IMAGES_DIR);

    // 提取使用中的文件名
    const usedFilenames = usedImages
      .map(img => img.uri.split('/').pop())
      .filter(Boolean);

    // 删除未使用的文件
    for (const file of files) {
      if (!usedFilenames.includes(file)) {
        await FileSystem.deleteAsync(`${IMAGES_DIR}${file}`, { idempotent: true });
      }
    }
  } catch (error) {
    console.error('清理图片失败:', error);
  }
};

/**
 * 获取图片存储目录的总大小
 * @returns 目录大小（字节）
 */
export const getImageStorageSize = async (): Promise<number> => {
  try {
    await ensureImageDirectory();
    const files = await FileSystem.readDirectoryAsync(IMAGES_DIR);

    let totalSize = 0;
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${IMAGES_DIR}${file}`);
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('获取存储大小失败:', error);
    return 0;
  }
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串（如 "1.5 MB"）
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file://mock/',
  cacheDirectory: 'file://mock/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));
import {
  saveImageToLocal,
  deleteLocalImage,
  cleanupUnusedImages,
  getImageStorageSize,
  formatFileSize,
  getImageSize,
} from '../src/utils/imageManager';
import { NoteImage } from '../src/types';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

describe('imageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves images to local directory', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.123456);
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

    const result = await saveImageToLocal('file://tmp/photo.png');

    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
    expect(FileSystem.copyAsync).toHaveBeenCalledWith({
      from: 'file://tmp/photo.png',
      to: result,
    });
    expect(result).toContain('file://mock/images/');
    expect(result).toContain('.png');

    nowSpy.mockRestore();
    randomSpy.mockRestore();
  });

  it('deletes local images if they exist', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

    await deleteLocalImage('file://mock/images/one.png');

    expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file://mock/images/one.png');
  });

  it('cleans up unused images', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
    (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue([
      'keep.png',
      'remove.png',
    ]);

    const usedImages: NoteImage[] = [
      { id: '1', uri: 'file://mock/images/keep.png' },
    ];

    await cleanupUnusedImages(usedImages);

    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      'file://mock/images/remove.png',
      { idempotent: true }
    );
  });

  it('calculates image storage size', async () => {
    (FileSystem.getInfoAsync as jest.Mock)
      .mockResolvedValueOnce({ exists: true })
      .mockResolvedValueOnce({ exists: true, isDirectory: false, size: 100 })
      .mockResolvedValueOnce({ exists: true, isDirectory: false, size: 300 });
    (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue([
      'a.png',
      'b.png',
    ]);

    const size = await getImageStorageSize();

    expect(size).toBe(400);
  });

  it('formats file sizes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1.00 KB');
  });

  it('reads image size', async () => {
    (Image.getSize as jest.Mock).mockImplementation(
      (_uri: string, success: (w: number, h: number) => void) => {
        success(640, 480);
      }
    );

    await expect(getImageSize('file://mock/images/one.png')).resolves.toEqual({
      width: 640,
      height: 480,
    });
  });
});

import { describe, it, expect } from 'vitest';
import { formatFileSize, formatDate, getFileIcon, getFileColor } from '../utils/formatters';

describe('formatFileSize', () => {
  it('should return 0 Bytes for 0', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format KB correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should format MB correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('should format GB correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

describe('getFileIcon', () => {
  it('should return image for image mime types', () => {
    expect(getFileIcon('image/png')).toBe('image');
    expect(getFileIcon('image/jpeg')).toBe('image');
    expect(getFileIcon('image/gif')).toBe('image');
  });

  it('should return video for video mime types', () => {
    expect(getFileIcon('video/mp4')).toBe('video');
    expect(getFileIcon('video/webm')).toBe('video');
  });

  it('should return audio for audio mime types', () => {
    expect(getFileIcon('audio/mp3')).toBe('audio');
    expect(getFileIcon('audio/wav')).toBe('audio');
  });

  it('should return archive for archive types', () => {
    expect(getFileIcon('application/zip')).toBe('archive');
    expect(getFileIcon('application/x-rar-compressed')).toBe('archive');
  });

  it('should return file for unknown types', () => {
    expect(getFileIcon('application/octet-stream')).toBe('file');
    expect(getFileIcon(null)).toBe('file');
  });
});

describe('getFileColor', () => {
  it('should return purple for images', () => {
    expect(getFileColor('image/png')).toContain('purple');
  });

  it('should return red for videos', () => {
    expect(getFileColor('video/mp4')).toContain('red');
  });

  it('should return orange for audio', () => {
    expect(getFileColor('audio/mp3')).toContain('orange');
  });

  it('should return gray for unknown types', () => {
    expect(getFileColor('application/octet-stream')).toContain('gray');
  });
});
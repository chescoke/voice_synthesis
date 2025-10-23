/**
 * S3 Service Unit Tests
 * Tests S3 file upload, download, and stream operations
 */

import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Service } from '../../../src/services/s3.service';
import { Readable } from 'stream';

// Mock S3 client
const s3Mock = mockClient(S3Client);

// Mock Upload from lib-storage
const mockUploadDone = jest.fn();
jest.mock('@aws-sdk/lib-storage', () => {
  return {
    Upload: jest.fn().mockImplementation(() => ({
      done: mockUploadDone,
    })),
  };
});

// Type assertion for Upload mock
const MockedUpload = Upload as jest.MockedClass<typeof Upload>;

describe('S3Service', () => {
  let s3Service: S3Service;

  beforeEach(() => {
    // Reset mocks before each test
    s3Mock.reset();
    jest.clearAllMocks();
    mockUploadDone.mockResolvedValue({});
    
    // Create new instance
    s3Service = new S3Service();
  });

  afterEach(() => {
    s3Mock.restore();
  });

  describe('uploadAudio', () => {
    it('should upload audio buffer to S3 successfully', async () => {
      const testBuffer = Buffer.from('test audio data');
      const testFileName = 'test-audio.mp3';
      const testContentType = 'audio/mpeg';

      const result = await s3Service.uploadAudio(
        testBuffer,
        testFileName,
        testContentType
      );

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.url).toContain('test-bucket');
      expect(result.url).toContain('.mp3');
      expect(MockedUpload).toHaveBeenCalledTimes(1);
    });

    it('should use correct content type', async () => {
      const testBuffer = Buffer.from('test audio data');
      const testFileName = 'test.webm';
      const testContentType = 'audio/webm';

      await s3Service.uploadAudio(testBuffer, testFileName, testContentType);

      const uploadCall = MockedUpload.mock.calls[0][0];
      expect(uploadCall.params.ContentType).toBe(testContentType);
    });

    it('should generate unique keys with UUID', async () => {
      const testBuffer = Buffer.from('test audio data');
      
      const result1 = await s3Service.uploadAudio(testBuffer, 'test.mp3');
      const result2 = await s3Service.uploadAudio(testBuffer, 'test.mp3');

      expect(result1.key).not.toBe(result2.key);
      expect(result1.key).toContain('test.mp3');
      expect(result2.key).toContain('test.mp3');
    });

    it('should use configured audio folder', async () => {
      const testBuffer = Buffer.from('test audio data');
      
      const result = await s3Service.uploadAudio(testBuffer, 'test.mp3');

      expect(result.key).toContain('test-audio/');
    });

    it('should use default content type if not provided', async () => {
      const testBuffer = Buffer.from('test audio data');
      
      await s3Service.uploadAudio(testBuffer, 'test.mp3');

      const uploadCall = MockedUpload.mock.calls[0][0];
      expect(uploadCall.params.ContentType).toBe('audio/mpeg');
    });

    it('should throw error on upload failure', async () => {
      mockUploadDone.mockRejectedValueOnce(new Error('Upload failed'));

      const testBuffer = Buffer.from('test audio data');

      await expect(
        s3Service.uploadAudio(testBuffer, 'test.mp3')
      ).rejects.toThrow('Failed to upload audio to S3');
    });

    it('should handle empty buffer', async () => {
      const emptyBuffer = Buffer.from('');

      const result = await s3Service.uploadAudio(emptyBuffer, 'empty.mp3');

      expect(result).toBeDefined();
      expect(MockedUpload).toHaveBeenCalled();
    });

    it('should handle special characters in filename', async () => {
      const testBuffer = Buffer.from('test');
      const specialFileName = 'test áudio-español.mp3';

      const result = await s3Service.uploadAudio(testBuffer, specialFileName);

      expect(result.key).toContain(specialFileName);
    });
  });

  describe('uploadAudioStream', () => {
    it('should upload audio stream to S3 successfully', async () => {
      const testStream = Readable.from(['test', 'audio', 'stream']);
      const testFileName = 'stream-audio.mp3';

      const result = await s3Service.uploadAudioStream(
        testStream,
        testFileName
      );

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.key).toContain('audio/');
      expect(MockedUpload).toHaveBeenCalledTimes(1);
    });

    it('should use correct content type for stream', async () => {
      const testStream = Readable.from(['test']);
      
      await s3Service.uploadAudioStream(
        testStream,
        'test.webm',
        'audio/webm'
      );

      const uploadCall = MockedUpload.mock.calls[0][0];
      expect(uploadCall.params.ContentType).toBe('audio/webm');
    });

    it('should throw error on stream upload failure', async () => {
      mockUploadDone.mockRejectedValueOnce(new Error('Stream upload failed'));

      const testStream = Readable.from(['test']);

      await expect(
        s3Service.uploadAudioStream(testStream, 'test.mp3')
      ).rejects.toThrow('Failed to upload audio stream to S3');
    });
  });

  describe('getAudio', () => {
    it('should retrieve audio from S3 successfully', async () => {
      const mockStream = Readable.from(['audio', 'data']);
      
      s3Mock.on(GetObjectCommand).resolves({
        Body: mockStream as any,
      });

      const result = await s3Service.getAudio('test-key');

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Readable);
    });

    it('should throw error if no body in response', async () => {
      s3Mock.on(GetObjectCommand).resolves({
        Body: undefined,
      });

      await expect(
        s3Service.getAudio('test-key')
      ).rejects.toThrow('No body in S3 response');
    });

    it('should throw error on get failure', async () => {
      s3Mock.on(GetObjectCommand).rejects(new Error('Access denied'));

      await expect(
        s3Service.getAudio('test-key')
      ).rejects.toThrow('Failed to get audio from S3');
    });

    it('should use correct bucket and key', async () => {
      const mockStream = Readable.from(['test']);
      s3Mock.on(GetObjectCommand).resolves({
        Body: mockStream as any,
      });

      await s3Service.getAudio('my-audio-key');

      const call = s3Mock.commandCalls(GetObjectCommand)[0];
      expect(call.args[0].input.Bucket).toBe('test-bucket');
      expect(call.args[0].input.Key).toBe('my-audio-key');
    });
  });

  describe('Configuration', () => {
    it('should initialize with correct configuration', () => {
      expect(s3Service.s3AudioFolder).toBe('test-audio');
    });

    it('should construct correct S3 URLs', async () => {
      const testBuffer = Buffer.from('test');
      
      const result = await s3Service.uploadAudio(testBuffer, 'test.mp3');

      expect(result.url).toMatch(
        /https:\/\/test-bucket\.s3\.us-east-1\.amazonaws\.com\/.+/
      );
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error messages', async () => {
      mockUploadDone.mockRejectedValueOnce(new Error('Network error'));

      try {
        await s3Service.uploadAudio(Buffer.from('test'), 'test.mp3');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Failed to upload audio to S3');
        expect(error.message).toContain('Network error');
      }
    });
  });
});
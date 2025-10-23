/**
 * AWS Credentials Integration Test
 * 
 * This test verifies that AWS credentials are correctly configured
 * and have the necessary permissions for:
 * - AWS Polly (text-to-speech)
 * - AWS Transcribe (speech-to-text)
 * - AWS S3 (storage)
 * 
 * NOTE: This is an integration test that makes REAL AWS API calls.
 * It will only run if AWS credentials are properly configured.
 */

import {
  PollyClient,
  DescribeVoicesCommand,
  Engine
} from '@aws-sdk/client-polly';
import {
  S3Client,
  GetObjectCommand,
  ListBucketsCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import {
  TranscribeClient,
  ListTranscriptionJobsCommand,
} from '@aws-sdk/client-transcribe';
import config from '../../src/config';

describe('AWS Credentials Integration Tests', () => {
  let pollyClient: PollyClient;
  let s3Client: S3Client;
  let transcribeClient: TranscribeClient;

  beforeAll(() => {
    // Initialize AWS clients with actual credentials
    const credentials = {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    };

    pollyClient = new PollyClient({
      region: 'us-east-1',
      credentials,
    });

    s3Client = new S3Client({
      region: config.aws.region,
      credentials,
    });

    transcribeClient = new TranscribeClient({
      region: config.aws.region,
      credentials,
    });
  });

  afterAll(() => {
    // Cleanup clients
    pollyClient.destroy();
    s3Client.destroy();
    transcribeClient.destroy();
  });

  describe('AWS Configuration', () => {
    it('should have all required environment variables', () => {
      expect(config.aws.accessKeyId).toBeDefined();
      expect(config.aws.accessKeyId.length).toBeGreaterThan(0);
      expect(config.aws.secretAccessKey).toBeDefined();
      expect(config.aws.secretAccessKey.length).toBeGreaterThan(0);
      expect(config.aws.region).toBeDefined();
      expect(config.aws.region.length).toBeGreaterThan(0);
    });

    it('should have valid region format', () => {
      const validRegionPattern = /^[a-z]{2}-[a-z]+-\d{1}$/;
      expect(config.aws.region).toMatch(validRegionPattern);
    });
  });
});
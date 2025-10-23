import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { UploadResult } from '../types';

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  s3AudioFolder: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
    this.bucket = config.aws.s3Bucket;
    this.s3AudioFolder = config.aws.s3AudioFolder;
  }

  /**
   * Upload audio file to S3
   */
  async uploadAudio(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = 'audio/mpeg'
  ): Promise<UploadResult> {
    try {
      const key = `${this.s3AudioFolder}/${uuidv4()}-${fileName}`;
      
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        },
      });

      await upload.done();

      const url = `https://${this.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error(`Failed to upload audio to S3: ${error}`);
    }
  }

  /**
   * Upload audio stream to S3
   */
  async uploadAudioStream(
    stream: Readable,
    fileName: string,
    contentType: string = 'audio/mpeg'
  ): Promise<UploadResult> {
    try {
      const key = `audio/${uuidv4()}-${fileName}`;

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: stream,
          ContentType: contentType,
        },
      });

      await upload.done();

      const url = `https://${this.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error) {
      console.error('Error uploading stream to S3:', error);
      throw new Error(`Failed to upload audio stream to S3: ${error}`);
    }
  }

  /**
   * Get audio file from S3
   */
  async getAudio(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No body in S3 response');
      }

      return response.Body as Readable;
    } catch (error) {
      console.error('Error getting from S3:', error);
      throw new Error(`Failed to get audio from S3: ${error}`);
    }
  }
}

export default new S3Service();
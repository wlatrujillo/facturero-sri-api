
import { S3Client, ListBucketsCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export class StorageService {

    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({ region: "us-east-1" });
    }

    public async listBuckets(): Promise<string[]> {
        const command = new ListBucketsCommand({});
        const response = await this.s3Client.send(command);
        return response.Buckets ? response.Buckets.map(bucket => bucket.Name || "") : [];
    }

    public async createBucket(bucketName: string): Promise<void> {
        // Implementation for creating a bucket goes here
    }

    public async getBucketInfo(bucketName: string): Promise<any> {
        // Implementation for getting bucket info goes here
    }

    public async createFolder(bucketName: string, folderName: string): Promise<void> {
        // Implementation for creating a folder goes here
    }

    public async uploadFile(bucketName: string, folderName: string, fileName: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: `${folderName}/${fileName}`,
                Body: fileContent
            });
            await this.s3Client.send(command);
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    public async getFileBuffer(bucketName: string, folderName: string, fileName: string): Promise<Buffer<ArrayBuffer>> {
        // Implementation for getting a file goes here
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: `${folderName}/${fileName}`
            });
            const response = await this.s3Client.send(command);
            if (response.Body) {
                const streamToBuffer = (stream: any): Promise<Buffer<ArrayBuffer>> => {
                    return new Promise((resolve, reject) => {
                        const chunks: Uint8Array[] = [];
                        stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
                        stream.on("error", reject);
                        stream.on("end", () => resolve(Buffer.concat(chunks)));
                    });
                };
                return await streamToBuffer(response.Body);
            } else {
                throw new Error("File not found");
            }
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }


}

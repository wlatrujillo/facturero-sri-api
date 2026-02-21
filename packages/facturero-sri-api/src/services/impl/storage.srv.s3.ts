import log4js from 'log4js';
import { Buffer } from 'buffer';
import { S3Client, GetObjectCommand, PutObjectCommand, type GetObjectCommandOutput } from "@aws-sdk/client-s3";

import type { StorageService } from '../../services/storage.srv.js';

const NODE_ENV = process.env.NODE_ENV || 'dev';
const BUCKET_NAME = `${NODE_ENV}-facturero-sri-vouchers`;
const BUCKET_NAME_STORAGE = `${NODE_ENV}-facturero-sri-storage`;


export class S3StorageService implements StorageService {

    private readonly logger = log4js.getLogger("S3StorageService");
    private readonly generatedDir = 'generados';
    private readonly signedDir = 'firmados';
    private readonly authorizedDir = 'autorizados';

    private s3Client: S3Client;

    constructor(
        private region: string = 'us-east-1') {
        this.s3Client = new S3Client({ region: this.region });
    }

    public async readCertificateP12(companyId: string): Promise<Buffer> {
        // Implementation for uploading a file goes here

        return await this.readFile(BUCKET_NAME_STORAGE, `${companyId}`, `${companyId}.p12`);

    }

    public async writeCertificateP12(companyId: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here

        await this.writeFile(BUCKET_NAME_STORAGE, `${companyId}`, `${companyId}.p12`, fileContent);

    }

    public async writeSignedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here

        await this.writeFile(BUCKET_NAME, `${companyId}/${this.signedDir}`, `${accessKey}.xml`, fileContent);

    }

    public async writeAuthorizedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here

        await this.writeFile(BUCKET_NAME, `${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`, fileContent);

    }

    public async writeGeneratedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here

        await this.writeFile(BUCKET_NAME, `${companyId}/${this.generatedDir}`, `${accessKey}.xml`, fileContent);

    }

    public async readGeneratedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here

        const response = await this.readFile(BUCKET_NAME, `${companyId}/${this.generatedDir}`, `${accessKey}.xml`);
        if (response) {
            return response;
        } else {
            throw new Error("File not found");
        }

    }

    public async readSignedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here

        const response = await this.readFile(BUCKET_NAME, `${companyId}/${this.signedDir}`, `${accessKey}.xml`);
        if (response) {
            return response;
        } else {
            throw new Error("File not found");
        }

    }

    public async readAuthorizedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here

        const response = await this.readFile(BUCKET_NAME, `${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`);
        if (response) {
            return response;
        } else {
            throw new Error("File not found");
        }

    }


    private async writeFile(bucketName: string, folderName: string, fileName: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: `${folderName}/${fileName}`,
                Body: fileContent
            });
            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Error writing file to S3: ${error}`);
            throw error;
        }
    }

    private async readFile(bucketName: string, folderName: string, fileName: string): Promise<Buffer> {
        // Implementation for getting a file goes here

        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: `${folderName}/${fileName}`
            });
            const response: GetObjectCommandOutput = await this.s3Client.send(command);

            if (!response.Body) {
                throw new Error("File not found");
            }

            return Buffer.from(await response.Body.transformToByteArray());

        } catch (error) {
            this.logger.error(`Error reading file from S3: ${error}`);
            throw error;
        }
    }



}

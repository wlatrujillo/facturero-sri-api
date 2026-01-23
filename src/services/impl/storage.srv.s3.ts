import log4js from 'log4js';
import { Buffer } from 'buffer';
import { S3Client, GetObjectCommand, PutObjectCommand, type GetObjectCommandOutput } from "@aws-sdk/client-s3";

import type { StorageService } from '@services/storage.srv.js';
import { ENVIRONMENT_TYPE } from '@enums/environment.type.js';

const BUCKET_NAME = process.env.BUCKET_NAME || "dev-facturero-storage";

const logger = log4js.getLogger("S3StorageService");
export class S3StorageService implements StorageService {

    private readonly generatedDir = 'generados';
    private readonly signedDir = 'firmados';
    private readonly authorizedDir = 'autorizados';
    private readonly certDir = 'certs';

    private s3Client: S3Client;

    constructor(private readonly env: ENVIRONMENT_TYPE = ENVIRONMENT_TYPE.TEST) {
        this.s3Client = new S3Client({ region: "us-east-1" });
    }

    public async readCertificateP12(companyId: string): Promise<Buffer> {
        // Implementation for uploading a file goes here
        logger.debug(`Reading certificate P12 for companyId: ${companyId}`);
        try {
            return await this.readFile(this.certDir, `${companyId}.p12`);
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }

    public async writeCertificateP12(companyId: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(this.certDir, `${companyId}.p12`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async writeGeneratedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(`${companyId}/${this.generatedDir}`, `${accessKey}.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async writeSignedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(`${companyId}/${this.signedDir}`, `${accessKey}.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async writeAuthorizedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(`${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async readGeneratedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here
        try {
            const response = await this.readFile(`${companyId}/${this.generatedDir}`, `${accessKey}.xml`);
            if (response) {
                return response;
            } else {
                throw new Error("File not found");
            }
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }

    public async readSignedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here
        try {
            const response = await this.readFile(`${companyId}/${this.signedDir}`, `${accessKey}.xml`);
            if (response) {
                return response;
            } else {
                throw new Error("File not found");
            }
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }

    public async readAuthorizedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here
        try {
            const response = await this.readFile(`${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`);
            if (response) {
                return response;
            } else {
                throw new Error("File not found");
            }
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }


    private async writeFile(folderName: string, fileName: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: this.env == ENVIRONMENT_TYPE.TEST ? `test/${folderName}/${fileName}` : `${folderName}/${fileName}`,
                Body: fileContent
            });
            await this.s3Client.send(command);
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    private async readFile(folderName: string, fileName: string): Promise<Buffer> {
        // Implementation for getting a file goes here

        try {
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: this.env == ENVIRONMENT_TYPE.TEST ? `test/${folderName}/${fileName}` : `${folderName}/${fileName}`
            });
            const response: GetObjectCommandOutput = await this.s3Client.send(command);

            if (!response.Body) {
                throw new Error("File not found");
            }

            // ✅ AWS SDK v3 helper
            return Buffer.from(await response.Body.transformToByteArray());

        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }



}

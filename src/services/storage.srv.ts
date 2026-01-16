import log4js from 'log4js';
import { Buffer } from 'buffer';

import { S3Repository } from "@repository/s3.repository.js";

const logger = log4js.getLogger("StorageService");
export class StorageService {

    private readonly generatedDir = 'generados';
    private readonly signedDir = 'firmados';
    private readonly authorizedDir = 'autorizados';
    private readonly certDir = 'certs';
    private s3Repository: S3Repository;

    constructor() {
        this.s3Repository = new S3Repository();
    }

    public async readCertificateP12(companyId: string): Promise<Buffer> {
        // Implementation for uploading a file goes here
        logger.debug(`Reading certificate P12 for companyId: ${companyId}`);
        try {
            return await this.s3Repository.readFile(this.certDir, `${companyId}.p12`);
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    public async writeCertificateP12(companyId: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.s3Repository.writeFile(this.certDir, `${companyId}.p12`, fileContent);
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    public async writeGeneratedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.s3Repository.writeFile(`${companyId}/${this.generatedDir}`, `${accessKey}.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    public async writeSignedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.s3Repository.writeFile(`${companyId}/${this.signedDir}`, `${accessKey}.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    public async writeAuthorizedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.s3Repository.writeFile(`${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    public async readGeneratedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here
        try {
            const response = await this.s3Repository.readFile(`${companyId}/${this.generatedDir}`, `${accessKey}.xml`);
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
            const response = await this.s3Repository.readFile(`${companyId}/${this.signedDir}`, `${accessKey}.xml`);
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
            const response = await this.s3Repository.readFile(`${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`);
            if (response) {
                return response;
            } else {
                throw new Error("File not found");
            }
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }



}

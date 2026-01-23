import log4js from 'log4js';
import { Buffer } from 'buffer';
import * as fs from 'fs';

import type { StorageService } from '../storage.srv.js';
import { ENVIRONMENT_TYPE } from '@enums/environment.type.js';

const BASE_DIR = './facturero_storage';
const BASE_DIR_TEST = './facturero_storage_test';

const logger = log4js.getLogger("StorageService");
export class FsStorageService implements StorageService {

    private readonly generatedDir = 'generados';
    private readonly signedDir = 'firmados';
    private readonly authorizedDir = 'autorizados';
    private readonly certDir = 'certs';

    private readonly baseDir: string;

    constructor(private readonly env: ENVIRONMENT_TYPE = ENVIRONMENT_TYPE.TEST) {

        this.baseDir = env === ENVIRONMENT_TYPE.TEST ? BASE_DIR_TEST : BASE_DIR;
        
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
        if (!fs.existsSync(`${this.baseDir}/${this.certDir}`)) {
            fs.mkdirSync(`${this.baseDir}/${this.certDir}`, { recursive: true });
        }
        if (!fs.existsSync(`${this.baseDir}/${this.generatedDir}`)) {
            fs.mkdirSync(`${this.baseDir}/${this.generatedDir}`, { recursive: true });
        }
        if (!fs.existsSync(`${this.baseDir}/${this.signedDir}`)) {
            fs.mkdirSync(`${this.baseDir}/${this.signedDir}`, { recursive: true });
        }
        if (!fs.existsSync(`${this.baseDir}/${this.authorizedDir}`)) {
            fs.mkdirSync(`${this.baseDir}/${this.authorizedDir}`, { recursive: true });
        }
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
        const dirPath = `${this.baseDir}/${folderName}`;
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        const filePath = `${dirPath}/${fileName}`;
        fs.writeFileSync(filePath, fileContent);
    }

    private async readFile(folderName: string, fileName: string): Promise<Buffer> {
        const filePath = `${this.baseDir}/${folderName}/${fileName}`;
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found");
        }
        return fs.readFileSync(filePath);
    }


}

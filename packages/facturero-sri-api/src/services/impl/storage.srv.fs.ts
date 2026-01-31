import log4js from 'log4js';
import { Buffer } from 'buffer';

import path from 'path';
import * as fs from 'fs';

import type { StorageService } from '../storage.srv.js';
import { ENVIRONMENT_TYPE } from '../../enums/environment.type.js';


const BASE_VOUCHERS_DIR_NAME = `facturero-sri-vouchers`;
const BASE_VOUCHERS_DIR_NAME_TEST = `facturero-sri-vouchers-test`;
const BASE_STORAGE_DIR_NAME = `facturero-sri-storage`;

const logger = log4js.getLogger("StorageService");
export class FsStorageService implements StorageService {

    private readonly generatedDir = 'generados';
    private readonly signedDir = 'firmados';
    private readonly authorizedDir = 'autorizados';
    private readonly baseVouchersDir: string;

    constructor(private readonly env: ENVIRONMENT_TYPE = ENVIRONMENT_TYPE.TEST) {

        this.baseVouchersDir = this.env === ENVIRONMENT_TYPE.TEST ? BASE_VOUCHERS_DIR_NAME_TEST : BASE_VOUCHERS_DIR_NAME;

    }

    public async readCertificateP12(companyId: string): Promise<Buffer> {
        // Implementation for uploading a file goes here
        logger.debug(`Reading certificate P12 for companyId: ${companyId}`);
        try {
            return await this.readFile(BASE_STORAGE_DIR_NAME, `${companyId}`, `${companyId}.p12`);
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }

    public async writeCertificateP12(companyId: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(BASE_STORAGE_DIR_NAME, `${companyId}`, `${companyId}.p12`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async writeGeneratedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(this.baseVouchersDir, `${companyId}/${this.generatedDir}`, `${accessKey}.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async writeSignedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(this.baseVouchersDir, `${companyId}/${this.signedDir}`, `${accessKey}.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async writeAuthorizedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void> {
        // Implementation for uploading a file goes here
        try {
            await this.writeFile(this.baseVouchersDir, `${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`, fileContent);
        } catch (error) {
            throw new Error(`Error writing file: ${error}`);
        }
    }

    public async readGeneratedVoucher(companyId: string, accessKey: string): Promise<Buffer> {
        // Implementation for getting a file goes here
        try {
            const response = await this.readFile(this.baseVouchersDir, `${companyId}/${this.generatedDir}`, `${accessKey}.xml`);
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
            const response = await this.readFile(this.baseVouchersDir, `${companyId}/${this.signedDir}`, `${accessKey}.xml`);
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
            const response = await this.readFile(this.baseVouchersDir, `${companyId}/${this.authorizedDir}`, `${accessKey}_aut.xml`);
            if (response) {
                return response;
            } else {
                throw new Error("File not found");
            }
        } catch (error) {
            throw new Error(`Error getting file: ${error}`);
        }
    }

    private async writeFile(baseDir: string, folderName: string, fileName: string, fileContent: Buffer): Promise<void> {

        const dirPath = path.join(__dirname, '..', '..', '..','..', '..', baseDir, folderName);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        const filePath = `${dirPath}/${fileName}`;
        fs.writeFileSync(filePath, fileContent);
    }

    private async readFile(baseDir: string, folderName: string, fileName: string): Promise<Buffer> {
     
        logger.debug(`Reading file from path: ${__dirname}`);
        const filePath = path.join(__dirname, '..', '..', '..', '..', '..', baseDir, folderName, fileName);
        if (!fs.existsSync(filePath)) {
            logger.error(`File not found at path: ${filePath}`);
            throw new Error("File not found");
        }
        return fs.readFileSync(filePath);
    }


}

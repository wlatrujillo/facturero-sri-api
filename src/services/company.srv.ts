import crypto from 'crypto';

import CompanyRepository from '@repository/company.repository.js';
import type { IApiKey } from '@model/api-key.js';
import { ApiKey } from '@model/api-key.js';

export class CompanyService {

    private companyRepository: CompanyRepository;

    constructor() { 
        this.companyRepository = new CompanyRepository();
    }


    returnCompanyInfo = async (ruc: string) => {
        // Dummy implementation for example purposes
        return this.companyRepository.retrieve({ ruc });
    }

    registerCompany = async (companyData: any) => {

        let company = {
            ...companyData
        };

        const newApiKey  = this.generateApiKey(company.ruc);

        let apiKey: IApiKey = {
            companyId: company.ruc,
            name: "Default API Key",
            //keyHash: crypto.createHash('sha256').update(newApiKey).digest('hex'),
            keyHash: newApiKey,
            environment: 'live',
            status: 'ACTIVE',
            usagePlan: 'FREE',
            createdAt: new Date()
        } as IApiKey;

        await this.companyRepository.insertOne(company);

        await ApiKey.insertOne(apiKey);

        return newApiKey;
    }

    generateApiKey(ruc: string , env = 'live') {
        const random = crypto.randomBytes(24).toString('base64url');
        return `${ruc}_${env}_${random}`;
    }

}
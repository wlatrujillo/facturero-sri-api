import crypto from 'crypto';
import log4js from 'log4js';
import type { IApiKey, ICompany } from '@model/company.js';

import { CompanyRepository } from '../repository/company.repository.js';


export class CompanyService {


    private readonly logger = log4js.getLogger("CompanyService");
    private repository: CompanyRepository;

    constructor() {
        this.repository = new CompanyRepository();
    }


    findCompany = async (ruc: string) => {

        const key = { companyId: ruc };
        const result = await this.repository.findById(key);
        return result;
    }

    createCompany = async (company: ICompany) => {

        try {
            this.logger.info(`Registering company  ${company}`);

            const now = new Date().toISOString();

            let newApiKeyData: IApiKey = {
                name: "Default API Key",
                //secret: crypto.createHash('sha256').update(newApiKey).digest('hex'),
                secret: this.generateApiKey(company.companyId),
                environment: 'live',
                status: 'ACTIVE',
                usagePlan: 'FREE'
            } as IApiKey;

            company.apiKey = newApiKeyData;
            company.createdAt = now;
            company.updatedAt = now;


            await this.repository.insert(company);
            return newApiKeyData;
            
        } catch (error) {
            this.logger.error("Error inserting company:", error);
            throw error;
        }


    }

    checkApiKey = async (apiKey: string) => {
        if (!apiKey) return false;
        const companyId = apiKey.split('_')[0] || '';
        const company = await this.repository.findById({ companyId });
        if (!company) return false;
        if (company.apiKey.status !== 'ACTIVE') return false;
        const secret = company.apiKey.secret;
        return apiKey === secret;
    }

    private generateApiKey(ruc: string, env = 'live') {
        const random = crypto.randomBytes(24).toString('base64url');
        return `${ruc}_${env}_${random}`;
    }

}
import crypto from 'crypto';
import log4js from 'log4js';
import type { IApiKey, ICompany } from '@model/company.js';
import type { CompanyRepository } from '@repository/company.repository.js';
import type { CompanyService } from '@services/company.srv.js';

export class CompanyServiceImpl implements CompanyService {


    private readonly logger = log4js.getLogger("CompanyService");

    constructor(private readonly repository: CompanyRepository) {
    }


    findCompany = async (ruc: string) : Promise<ICompany | null> => {

        const key = { companyId: ruc };
        const result = await this.repository.findById(key);
        return result;
    }

    createCompany = async (company: ICompany) : Promise<IApiKey> => {

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

    checkApiKey = async (apiKey: string) : Promise<boolean> => {
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
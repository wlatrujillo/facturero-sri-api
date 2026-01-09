import crypto from 'crypto';
import log4js from 'log4js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { IApiKey, ICompany } from '@model/company.js';


const TABLE_NAME = 'facturero-companies';

export class CompanyService {


    private readonly logger = log4js.getLogger("CompanyService");
    private client;
    private docClient;

    constructor() {
        this.client = new DynamoDBClient({ region: "us-east-1" });
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }


    find = async (ruc: string) => {

        const getCommand = new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                companyId: ruc
            }
        });

        const result = await this.docClient.send(getCommand);

        return result.Item;
    }

    insert = async (company: ICompany) => {

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


            const putCommand = new PutCommand({
                TableName: TABLE_NAME,
                Item: company,
                ConditionExpression: "attribute_not_exists(companyId)" // Prevent overwriting existing item,
            });



            await this.docClient.send(putCommand);
            return newApiKeyData;
            
        } catch (error) {
            this.logger.error("Error inserting company:", error);
            throw error;
        }


    }

    checkApiKey = async (apiKey: string) => {
        if (!apiKey) return false;
        const companyId = apiKey.split('_')[0] || '';
        const company = await this.find(companyId);
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
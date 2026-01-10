import log4js from 'log4js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { ICompany } from '@model/company.js';

const TABLE_NAME = 'facturero-companies';

export class CompanyRepository {
    // Repository methods will be defined here

    private readonly logger = log4js.getLogger("CompanyRepository");
    private client;
    private docClient;

    constructor() {
        this.client = new DynamoDBClient({ region: "us-east-1" });
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }

    findById = async (key: {companyId: string}) => {

        const getCommand = new GetCommand({
            TableName: TABLE_NAME,
            Key: key
        });

        const result = await this.docClient.send(getCommand);

        return result.Item;

    }

    insert = async (company: ICompany) => {



        const putCommand = new PutCommand({
            TableName: TABLE_NAME,
            Item: company,
            ConditionExpression: "attribute_not_exists(companyId)" // Prevent overwriting existing item,
        });



        await this.docClient.send(putCommand);
    }


}
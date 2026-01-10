import log4js from 'log4js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, type PutCommandOutput, type GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { IVoucher } from '@model/voucher.js';

const TABLE_NAME = 'facturero-vouchers';

export class VoucherRepository {
    // Repository methods will be defined here
    private readonly logger = log4js.getLogger("VoucherRepository");
    private client;
    private docClient;

    constructor() {
        this.client = new DynamoDBClient({ region: "us-east-1" });
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }

    insert = async (voucher: IVoucher) => {
        // Implementation for inserting a voucher goes here
        const putCommand = new PutCommand({
            TableName: TABLE_NAME,
            Item: voucher,
            ConditionExpression: "attribute_not_exists(companyId) AND attribute_not_exists(key)" // Prevent overwriting existing item,
        });

        const result: PutCommandOutput = await this.docClient.send(putCommand);

        return result;

    }

    findById = async (key: { companyId: string, key: string }) => {
        // Implementation for finding a voucher by ID goes here

        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: key
        });

        const result: GetCommandOutput = await this.docClient.send(command);

        return result.Item;

    }
}

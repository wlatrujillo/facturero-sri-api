import log4js from 'log4js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, type PutCommandOutput, type GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { IVoucher } from '@model/voucher.js';
import { ENVIRONMENT_TYPE } from '@enums/environment.type.js';
import { VOUCHER_STATUS } from '@enums/voucher.status.js';
import type { IVoucherKey } from '@model/voucher.key.js';

const TABLE_NAME = 'facturero-vouchers';
const TABLE_NAME_TEST = 'facturero-vouchers-test';

export class VoucherRepository {
    // Repository methods will be defined here
    private readonly logger = log4js.getLogger("VoucherRepository");
    private client;
    private docClient;
    private tableName: string;

    constructor(private readonly env: ENVIRONMENT_TYPE) {
        this.client = new DynamoDBClient({ region: "us-east-1" });
        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.tableName = this.env === ENVIRONMENT_TYPE.TEST ? TABLE_NAME_TEST : TABLE_NAME;
    }

    insert = async (voucher: IVoucher) : Promise<IVoucher> => {
        // Implementation for inserting a voucher goes here
        const putCommand = new PutCommand({
            TableName: this.tableName,
            Item: voucher,
            ConditionExpression: "attribute_not_exists(companyId) AND attribute_not_exists(key)" // Prevent overwriting existing item,
        });

        const result: PutCommandOutput = await this.docClient.send(putCommand);

        return voucher;

    }

    updateStatus = async (key: IVoucherKey, status: VOUCHER_STATUS) : Promise<void> => {
        // Implementation for updating a voucher status goes here
        // This is a placeholder implementation. Actual implementation may vary.
        this.logger.debug(`Updating voucher status for companyId: ${key.companyId}, key: ${key.sequence}`);

        const updateCommand = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                companyId: key.companyId,
                key: `#${key.voucherType}#${key.sequence}`
            },
            UpdateExpression: `SET #status = :status, updatedAt = :updatedAt`,
            ConditionExpression: "attribute_exists(companyId)",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": status,
                ":updatedAt": new Date().toISOString()
            },
            ReturnValues: "ALL_NEW"
        });

        await this.docClient.send(updateCommand);

    }

    findById = async (key: IVoucherKey) : Promise<IVoucher | undefined> => {
        // Implementation for finding a voucher by ID goes here

        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                companyId: key.companyId,
                key: `#${key.voucherType}#${key.sequence}`
            }
        });

        const result: GetCommandOutput = await this.docClient.send(command);

        return result.Item as IVoucher | undefined;

    }
}

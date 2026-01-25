import log4js from 'log4js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, type PutCommandOutput, type GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { IVoucher } from '@model/voucher.js';
import { ENVIRONMENT_TYPE } from '@enums/environment.type.js';
import { VOUCHER_STATUS } from '@enums/voucher.status.js';
import type { IVoucherKey } from '@model/voucher.key.js';

const NODE_ENV = process.env.NODE_ENV || 'dev';
const TABLE_NAME = `${NODE_ENV}-facturero-sri-vouchers`;
const TABLE_NAME_TEST = `${NODE_ENV}-facturero-sri-vouchers-test`;

export class VoucherRepository {
    // Repository methods will be defined here
    private readonly logger = log4js.getLogger("VoucherRepository");
    private client;
    private docClient;
    private tableName: string;

    constructor(private readonly region: string = "us-east-1", private readonly env: ENVIRONMENT_TYPE) {
        this.client = new DynamoDBClient({ region: this.region });
        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.tableName = this.env === ENVIRONMENT_TYPE.TEST ? TABLE_NAME_TEST : TABLE_NAME;
    }

    insert = async (voucher: IVoucher) : Promise<IVoucher> => {
        // Implementation for inserting a voucher goes here
        const putCommand = new PutCommand({
            TableName: this.tableName,
            Item: voucher,
            ConditionExpression: "attribute_not_exists(companyId) AND attribute_not_exists(voucherId)" // Prevent overwriting existing item,
        });

        const result: PutCommandOutput = await this.docClient.send(putCommand);

        return voucher;

    }

    updateStatus = async (voucherId: IVoucherKey, status: VOUCHER_STATUS) : Promise<void> => {
        // Implementation for updating a voucher status goes here
        // This is a placeholder implementation. Actual implementation may vary.
        this.logger.debug(`Updating voucher status for companyId: ${voucherId.companyId}, voucherId: ${voucherId.sequence}`);

        const updateCommand = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                companyId: voucherId.companyId,
                voucherId: `#${voucherId.voucherType}#${voucherId.establishment}#${voucherId.branch}#${voucherId.sequence}`
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

    findById = async (voucherId: IVoucherKey) : Promise<IVoucher | undefined> => {
        // Implementation for finding a voucher by ID goes here

        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                companyId: voucherId.companyId,
                voucherId: `#${voucherId.voucherType}#${voucherId.establishment}#${voucherId.branch}#${voucherId.sequence}`
            }
        });

        const result: GetCommandOutput = await this.docClient.send(command);

        return result.Item as IVoucher | undefined;

    }
}

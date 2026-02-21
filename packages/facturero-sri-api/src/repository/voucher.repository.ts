import log4js from 'log4js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, type GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { IVoucher } from '../model/voucher.js';
import type { IVoucherId } from '../model/voucher.id.js';

const NODE_ENV = process.env.NODE_ENV || 'dev';
const TABLE_NAME = `${NODE_ENV}-facturero-sri-vouchers`;

export class VoucherRepository {
    // Repository methods will be defined here
    private readonly logger = log4js.getLogger("VoucherRepository");
    private client;
    private docClient;
    private tableName: string;

    constructor(private readonly region: string = "us-east-1") {
        this.client = new DynamoDBClient({ region: this.region });
        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.tableName = TABLE_NAME;
    }

    insert = async (voucher: IVoucher): Promise<IVoucher> => {
        // Implementation for inserting a voucher goes here   
        const { voucherType, environment, establishment, branch, sequence } = voucher.voucherId;
        const persistentVoucher = {
            companyId: voucher.companyId,
            voucherId: `#${voucherType}#${environment}#${establishment}#${branch}#${sequence}`,
            accessKey: voucher.accessKey,
            xml: voucher.xml,
            status: voucher.status,
            sriStatus: voucher.sriStatus || '',
            messages: voucher.messages || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const putCommand = new PutCommand({
            TableName: this.tableName,
            Item: persistentVoucher,
            ConditionExpression: "attribute_not_exists(companyId) AND attribute_not_exists(voucherId)" // Prevent overwriting existing item,
        });

        await this.docClient.send(putCommand);

        return voucher;

    }

    update = async (companyId: string, voucherId: IVoucherId, voucher: IVoucher): Promise<void> => {
        // Implementation for updating a voucher status goes here
        // This is a placeholder implementation. Actual implementation may vary.
        this.logger.debug(`Updating voucher status for companyId: ${companyId}, voucherId: ${voucherId}`);

        const {voucherType, environment, establishment, branch, sequence} = voucherId;

        // Build dynamic update expression
        const updateExpressions: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        // Always update status, sriStatus, messages, and updatedAt
        updateExpressions.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        expressionAttributeValues[':status'] = voucher.status;

        updateExpressions.push('updatedAt = :updatedAt');
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        if (voucher.sriStatus && voucher.sriStatus.trim() !== '') {
            updateExpressions.push('#sriStatus = :sriStatus');
            expressionAttributeNames['#sriStatus'] = 'sriStatus';
            expressionAttributeValues[':sriStatus'] = voucher.sriStatus;
        }

        if (voucher.messages && voucher.messages.length > 0) {
            updateExpressions.push('#messages = :messages');
            expressionAttributeNames['#messages'] = 'messages';
            expressionAttributeValues[':messages'] = voucher.messages;
        }

        if (voucher.sriErrorIdentifier && voucher.sriErrorIdentifier.trim() !== '') {
            updateExpressions.push('#sriErrorIdentifier = :sriErrorIdentifier');
            expressionAttributeNames['#sriErrorIdentifier'] = 'sriErrorIdentifier';
            expressionAttributeValues[':sriErrorIdentifier'] = voucher.sriErrorIdentifier;
        }

        // Only add XML to update if it's provided and not empty
        if (voucher.xml && voucher.xml.trim() !== '') {
            updateExpressions.push('#xml = :xml');
            expressionAttributeNames['#xml'] = 'xml';
            expressionAttributeValues[':xml'] = voucher.xml;
        }

        if (voucher.accessKey && voucher.accessKey.trim() !== '') {
            updateExpressions.push('#accessKey = :accessKey');
            expressionAttributeNames['#accessKey'] = 'accessKey';
            expressionAttributeValues[':accessKey'] = voucher.accessKey;
        }

        const updateCommand = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                companyId: companyId,
                voucherId: `#${voucherType}#${environment}#${establishment}#${branch}#${sequence}`
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ConditionExpression: "attribute_exists(companyId)",
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        });

        await this.docClient.send(updateCommand);

    }

    findById = async (companyId: string, voucherId: IVoucherId): Promise<IVoucher | null> => {
        // Implementation for finding a voucher by ID goes here

        const {voucherType, environment, establishment, branch, sequence} = voucherId;

        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                companyId: companyId,
                voucherId: `#${voucherType}#${environment}#${establishment}#${branch}#${sequence}`
            }
        });

        const result: GetCommandOutput = await this.docClient.send(command);

        return result.Item as IVoucher | null;

    }
}

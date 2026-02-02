export interface SriAuthorizationResult {
    status: string;
    authorizationDate: string;
    environment: string;
    voucher: string;
    sriMessage?: string;
    sriStatus?: string;
    sriErrorIdentifier?: string;
    additionalInfo?: string;
    messages: string[];
}
import { ENVIRONMENT } from "../enums";

export interface SriAuthResponse {
    status: 'AUTHORIZED' | 'NOT_AUTHORIZED' | 'PROCESSING';
    authorizationDate: string;
    voucher: string;
    accessKey?: string;
    environment: ENVIRONMENT;
    sriErrorIdentifier: string;
    messages?: string[];
}
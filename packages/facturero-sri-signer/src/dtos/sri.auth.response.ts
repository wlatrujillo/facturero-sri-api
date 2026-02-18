import { ENVIRONMENT_ENUM } from "../enums";

export interface SriAuthResponse {
    status: 'AUTHORIZED' | 'NOT_AUTHORIZED' | 'PROCESSING';
    authorizationDate: string;
    voucher: string;
    accessKey?: string;
    environment: ENVIRONMENT_ENUM;
    sriErrorIdentifier: string;
    messages?: string[];
}
import type { VOUCHER_STATUS } from "@enums/voucher.status.js";

export interface IVoucher {
    companyId: string;
    key: string;
    accessKey?: string;
    xml: string;
    status: VOUCHER_STATUS;
    createdAt: string;  
    updatedAt: string;
}
import type { VOUCHER_STATUS } from "@enums/voucher.status.js";

export interface IVoucher {
    companyId: string;
    voucherId: string;
    accessKey?: string;
    xml: string;
    status: VOUCHER_STATUS;
    createdAt: string;  
    updatedAt: string;
}
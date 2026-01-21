import type { VoucherStatus } from "@enums/voucher.status.js";

export interface IVoucher {
    companyId: string;
    key: string;
    accessKey?: string;
    xml: string;
    status: VoucherStatus;
    createdAt: string;  
    updatedAt: string;
}
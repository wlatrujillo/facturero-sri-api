import type { VOUCHER_STATUS } from "../enums/voucher.status.js";
import { IVoucherId } from "./voucher.id.js";

export interface IVoucher {
    companyId: string;
    voucherId: IVoucherId;
    accessKey?: string;
    xml: string;
    status: VOUCHER_STATUS;
    sriStatus?: string;
    messages?: string[];
    createdAt: string;  
    updatedAt: string;
}
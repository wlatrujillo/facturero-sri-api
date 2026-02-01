import type { VOUCHER_TYPE } from "../enums/voucher.type.js";

export interface IVoucherId {
    voucherType: VOUCHER_TYPE;
    establishment: string;
    branch: string;
    sequence: string;
}
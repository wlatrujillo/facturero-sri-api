import type { VOUCHER_TYPE } from "@enums/voucher.type.js";

export interface IVoucherKey {
    companyId: string;
    voucherType: VOUCHER_TYPE;
    establishment: string;
    branch: string;
    sequence: string;
}
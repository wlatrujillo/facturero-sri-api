import { ENVIRONMENT_TYPE } from "../enums/environment.type.js";
import type { VOUCHER_TYPE } from "../enums/voucher.type.js";

export interface IVoucherId {
    voucherType: VOUCHER_TYPE;
    environment: ENVIRONMENT_TYPE;
    establishment: string;
    branch: string;
    sequence: string;
}
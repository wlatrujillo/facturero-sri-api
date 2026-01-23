import type { VoucherResponse } from "@dtos/voucher.response.js";
import type { ENVIRONMENT_TYPE } from "@enums/environment.type.js";

export interface VoucherServiceSri {

    executeInvoice(companyId: string, env: ENVIRONMENT_TYPE, invoiceData: any): Promise<VoucherResponse>;

    authorizeVoucher(companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<VoucherResponse>

}

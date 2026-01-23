import type { ENVIRONMENT_TYPE } from "@enums/environment.type.js";

export interface VoucherServiceSri {

    executeInvoice(companyId: string, env: ENVIRONMENT_TYPE, invoiceData: any): Promise<void>;

    authorizeVoucher(companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<void>

}

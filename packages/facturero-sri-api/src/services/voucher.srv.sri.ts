import type { AddInvoiceRequest } from "../dtos/add.invoice.request.js";
import type { AddVoucherResponse } from "../dtos/add.voucher.response.js";
import type { AuthVoucherResponse } from "../dtos/auth.voucher.response.js";
import type { ENVIRONMENT_TYPE } from "../enums/environment.type.js";

export interface VoucherServiceSri {

    executeInvoice(companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<AddVoucherResponse>;

    generateSignedInvoice(companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<string>;

    authorizeVoucher(companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<AuthVoucherResponse>

}

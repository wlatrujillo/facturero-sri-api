import type { AddInvoiceRequest } from "../dtos/add.invoice.request.js";
import type { AddVoucherResponse } from "../dtos/add.voucher.response.js";
import { GetVoucherResponse } from "../dtos/get.voucher.response.js";
import type { ENVIRONMENT_TYPE } from "../enums/environment.type.js";
import { IVoucherId } from "../model/voucher.id.js";

export interface VoucherServiceSri {

    executeSendInvoice(companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<AddVoucherResponse>;

    generateSignedInvoice(companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<AddVoucherResponse>;

    getStatusByVoucherId(companyId: string, voucherId: IVoucherId): Promise<GetVoucherResponse>;

}

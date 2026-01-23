
export interface VoucherServiceSri {

    executeInvoice(companyId: string, invoiceData: any): Promise<void>;

    authorizeVoucher(companyId: string, accessKey: string): Promise<void>

}

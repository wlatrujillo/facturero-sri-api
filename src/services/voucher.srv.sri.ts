
export interface VoucherServiceSri {

    executeInvoice(companyId: string, env: string, invoiceData: any): Promise<void>;

    authorizeVoucher(companyId: string, env: string, accessKey: string): Promise<void>

}

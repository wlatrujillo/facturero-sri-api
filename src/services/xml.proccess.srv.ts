
import type { InvoiceDTO } from "@dtos/invoice.dto.js";
import type { ValidationResult } from "@dtos/validation.result.js";
import type { VoucherResponse } from "@dtos/voucher.response.js";
export interface XmlProccessService {

  generateInvoiceXML(companyId: string, invoice: InvoiceDTO): Promise<VoucherResponse> ;
  signXML(cmd: { xmlBuffer: Buffer, p12Buffer: Buffer, password: string }): Promise<string> ;
  validateXML(xml: Buffer): Promise<ValidationResult> ; 
  authorizeXML(claveAcceso: string): Promise<void>; 

}
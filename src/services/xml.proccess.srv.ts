
import type { AddInvoiceRequest } from "@dtos/add.invoice.request.js";
import type { ValidationResult } from "@dtos/validation.result.js";
import type { VoucherResponse } from "@dtos/voucher.response.js";
import type { ENVIRONMENT_TYPE } from "@enums/environment.type.js";
export interface XmlProccessService {

  generateInvoiceXML(companyId: string, env:ENVIRONMENT_TYPE, invoice: AddInvoiceRequest): Promise<VoucherResponse> ;
  signXML(cmd: { xmlBuffer: Buffer, p12Buffer: Buffer, password: string }): Promise<string> ;
  validateXML(env:ENVIRONMENT_TYPE, xml: Buffer): Promise<ValidationResult> ; 
  authorizeXML(env:ENVIRONMENT_TYPE, claveAcceso: string): Promise<void>; 

}
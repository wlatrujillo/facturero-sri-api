
import type { AddInvoiceRequest } from "../dtos/add.invoice.request.js";
import type { SriAuthorizationResult } from "../dtos/sri.auth.result.js";
import type { SriValidationResult } from "../dtos/sri.validation.result.js";
import type { SriVoucherResult } from "../dtos/sri.voucher.result.js";
import type { ENVIRONMENT_TYPE } from "../enums/environment.type.js";
export interface SriProccessService {

  generateInvoiceXML(companyId: string, env:ENVIRONMENT_TYPE, invoice: AddInvoiceRequest): Promise<SriVoucherResult> ;
  signXML(cmd: { xmlBuffer: Buffer, p12Buffer: Buffer, password: string }): Promise<string> ;
  validateXML(env:ENVIRONMENT_TYPE, xml: Buffer): Promise<SriValidationResult> ; 
  authorizeXML(env:ENVIRONMENT_TYPE, claveAcceso: string): Promise<SriAuthorizationResult>; 

}
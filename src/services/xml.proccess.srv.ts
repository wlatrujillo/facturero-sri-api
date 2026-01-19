
import type { InvoiceDTO } from "@dtos/invoice.dto.js";
import type { ValidationResult } from "@dtos/validation.result.js";
import type { VoucherResponse } from "@dtos/voucher.response.js";
import type { ENVIROMENT_TYPE } from "@enums/enviroment.type.js";

export interface XmlProccessService {

  generateInvoiceXML(companyId: string, invoice: InvoiceDTO, enviromentType: ENVIROMENT_TYPE): Promise<VoucherResponse> ;
  signXML(cmd: { xmlBuffer: Buffer, p12Buffer: Buffer, password: string }): Promise<string> ;
  validateXML(xml: Buffer, env: ENVIROMENT_TYPE): Promise<ValidationResult> ; 
  authorizeXML(claveAcceso: string, env: ENVIROMENT_TYPE): Promise<void>; 

}
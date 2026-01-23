

import { ENVIRONMENT, VoucherGenerator, type InvoiceResponse } from "facturero-sri-signer";
import { XmlSigner } from "facturero-sri-signer"
import { AuthorizationService } from "facturero-sri-signer";

import { InvoiceMapper } from "@mappers/invoice.mapper.js";
import type { ValidationResult } from "dtos/validation.result.js";
import type { XmlProccessService } from "@services/xml.proccess.srv.js";
import { ENVIRONMENT_TYPE } from "@enums/environment.type.js";

import type { InvoiceDTO } from "@dtos/invoice.dto.js";
import type { VoucherResponse } from "@dtos/voucher.response.js";
import { VOUCHER_STATUS } from "@enums/voucher.status.js";

export class XmlProccessServiceFacturero implements XmlProccessService {

  private voucherGenerator: VoucherGenerator;
  private xmlSigner: XmlSigner;
  private authorizationService: AuthorizationService;
  private sriEnvironment: ENVIRONMENT;

  constructor(private readonly env: ENVIRONMENT_TYPE = ENVIRONMENT_TYPE.TEST) {
    this.voucherGenerator = new VoucherGenerator();
    this.xmlSigner = new XmlSigner();
    this.authorizationService = new AuthorizationService();
    this.sriEnvironment = this.env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;
  }

  async generateInvoiceXML(companyId: string, invoice: InvoiceDTO): Promise<VoucherResponse> {

    const invoiceSriModel = InvoiceMapper.toInvoiceSriModel(invoice);

    invoiceSriModel.infoTributaria.ambiente =  this.sriEnvironment;
    invoiceSriModel.infoTributaria.ruc = companyId;

    const generateInvoiceXMLResponse: InvoiceResponse = await this.voucherGenerator.generateXmlInvoice(invoiceSriModel);

    return {
      xml: generateInvoiceXMLResponse.xml,
      accessKey: generateInvoiceXMLResponse.accessKey,
      status: VOUCHER_STATUS.GENERATED,
      errors: []
    };
    
  }
  async signXML(cmd: { xmlBuffer: Buffer, p12Buffer: Buffer, password: string }): Promise<string> {
    return await this.xmlSigner.signXml(cmd.p12Buffer, cmd.password, cmd.xmlBuffer);
  }
  async validateXML(xml: Buffer): Promise<ValidationResult> {
    return await this.authorizationService.validateXml(this.sriEnvironment, xml);
  }

  async authorizeXML(claveAcceso: string): Promise<void> {
    return await this.authorizationService.authorizeXml(this.sriEnvironment, claveAcceso); // "test" o "prod"
  }

}
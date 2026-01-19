

import { ENVIRONMENT, VoucherGenerator, type InvoiceResponse } from "facturero-sri-signer";
import { XmlSigner } from "facturero-sri-signer"
import { AuthorizationService } from "facturero-sri-signer";

import { InvoiceMapper } from "@mappers/invoice.mapper.js";
import type { ValidationResult } from "dtos/validation.result.js";
import type { XmlProccessService } from "@services/xml.proccess.srv.js";
import { ENVIROMENT_TYPE } from "enums/enviroment.type.js";

import type { InvoiceDTO } from "@dtos/invoice.dto.js";
import type { VoucherResponse } from "@dtos/voucher.response.js";


export class XmlProccessServiceFacturero implements XmlProccessService {

  private voucherGenerator: VoucherGenerator;
  private xmlSigner: XmlSigner;
  private authorizationService: AuthorizationService;

  constructor() {
    this.voucherGenerator = new VoucherGenerator();
    this.xmlSigner = new XmlSigner();
    this.authorizationService = new AuthorizationService();
  }

  async generateInvoiceXML(companyId: string, invoice: InvoiceDTO, enviromentType: ENVIROMENT_TYPE): Promise<VoucherResponse> {

    const invoiceSriModel = InvoiceMapper.toInvoiceSriModel(invoice);

    invoiceSriModel.infoTributaria.ambiente =  enviromentType === ENVIROMENT_TYPE.PRODUCCION ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS
    invoiceSriModel.infoTributaria.ruc = companyId;

    const generateInvoiceXMLResponse: InvoiceResponse = await this.voucherGenerator.generateXmlInvoice(invoiceSriModel);

    return {
      xml: generateInvoiceXMLResponse.xml,
      accessKey: generateInvoiceXMLResponse.accessKey,
      status: "generated",
      errors: []
    };
    
  }
  async signXML(cmd: { xmlBuffer: Buffer, p12Buffer: Buffer, password: string }): Promise<string> {
    return await this.xmlSigner.signXml(cmd.p12Buffer, cmd.password, cmd.xmlBuffer);
  }
  async validateXML(xml: Buffer, env: ENVIROMENT_TYPE): Promise<ValidationResult> {
    const environment = env === ENVIROMENT_TYPE.PRODUCCION ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;
    return await this.authorizationService.validateXml(environment, xml);
  }

  async authorizeXML(claveAcceso: string, env: ENVIROMENT_TYPE): Promise<void> {
    const environment = env === ENVIROMENT_TYPE.PRODUCCION ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;
    return await this.authorizationService.authorizeXml(environment, claveAcceso); // "test" o "prod"
  }

}
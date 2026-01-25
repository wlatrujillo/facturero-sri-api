

import { ENVIRONMENT, VoucherGenerator, type InvoiceResponse } from "facturero-sri-signer";
import { XmlSigner } from "facturero-sri-signer"
import { AuthorizationService } from "facturero-sri-signer";

import { InvoiceMapper } from "@mappers/invoice.mapper.js";
import type { ValidationResult } from "dtos/validation.result.js";
import type { XmlProccessService } from "@services/xml.proccess.srv.js";
import { ENVIRONMENT_TYPE } from "@enums/environment.type.js";

import type { AddInvoiceRequest } from "@dtos/add.invoice.request.js";
import type { VoucherResponse } from "@dtos/voucher.response.js";
import { VOUCHER_STATUS } from "@enums/voucher.status.js";

export class XmlProccessServiceFacturero implements XmlProccessService {

  private voucherGenerator: VoucherGenerator;
  private xmlSigner: XmlSigner;
  private authorizationService: AuthorizationService;

  constructor() {
    this.voucherGenerator = new VoucherGenerator();
    this.xmlSigner = new XmlSigner();
    this.authorizationService = new AuthorizationService();
  }

  async generateInvoiceXML(companyId: string, env: ENVIRONMENT_TYPE, invoice: AddInvoiceRequest): Promise<VoucherResponse> {

    const invoiceSriModel = InvoiceMapper.toInvoiceSriModel(invoice);

    invoiceSriModel.infoTributaria.ambiente = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;
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

  async validateXML(env: ENVIRONMENT_TYPE, xml: Buffer): Promise<ValidationResult> {

    const environment = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;

    let validationResult: ValidationResult;
    try {

      console.log('Iniciando validación de XML...');

      const executionResult = await this.authorizationService.validateXml(environment, xml);

      console.log('Resultado de la validación:', executionResult);

      validationResult = {
        estado: executionResult.estado,
        mensajes: executionResult?.comprobantes?.comprobante.mensajes || []
      };

      return validationResult;


    } catch (error) {
      console.error('Error durante la validación de XML:', error);
      throw error;
    }
 

  }

  async authorizeXML(env: ENVIRONMENT_TYPE, claveAcceso: string): Promise<void> {
    const environment = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;
    return await this.authorizationService.authorizeXml(environment, claveAcceso); // "test" o "prod"
  }

}
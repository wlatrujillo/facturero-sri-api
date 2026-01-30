import log4js from 'log4js';

import { ENVIRONMENT, VoucherGenerator, AuthorizationService, XmlSignerImpl } from "facturero-sri-signer";
import type { InvoiceResponse } from "facturero-sri-signer";


import { InvoiceMapper } from "../../mappers/invoice.mapper.js";
import type { SriValidationResult } from "../../dtos/sri.validation.result.js";
import type { XmlProccessService } from "../../services/xml.proccess.srv.js";
import { ENVIRONMENT_TYPE } from "../../enums/environment.type.js";

import type { AddInvoiceRequest } from "../../dtos/add.invoice.request.js";
import type { VoucherResponse } from "../../dtos/voucher.response.js";
import { VOUCHER_STATUS } from "../../enums/voucher.status.js";
import { SriResultMapper } from "../../mappers/sri.result.mapper.js";
import type { SriAuthorizationResult } from "../../dtos/sri.auth.result.js";

export class XmlProccessServiceFacturero implements XmlProccessService {

  private readonly logger = log4js.getLogger('VoucherServiceSriImpl');
  private voucherGenerator: VoucherGenerator;
  private xmlSigner: XmlSignerImpl;
  private authorizationService: AuthorizationService;

  constructor() {
    this.voucherGenerator = new VoucherGenerator();
    this.xmlSigner = new XmlSignerImpl();
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

  async validateXML(env: ENVIRONMENT_TYPE, xml: Buffer): Promise<SriValidationResult> {

    const environment = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;

    try {
      const executionResult = await this.authorizationService.validateXml(environment, xml);
      return SriResultMapper.toSriValidationResult(executionResult);

    } catch (error) {
      this.logger.error('Error durante la validación de XML:', error);
      throw error;
    }


  }

  async authorizeXML(env: ENVIRONMENT_TYPE, claveAcceso: string): Promise<SriAuthorizationResult> {
    const environment = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;
    try {
      const executionResult = await this.authorizationService.authorizeXml(environment, claveAcceso);
      this.logger.debug('Resultado de la autorización:', executionResult);
      if (!executionResult) {
        throw new Error('No se recibió respuesta de autorización del SRI.');
      }
      return SriResultMapper.toSriAuthResult(executionResult);
    } catch (error) {
      this.logger.error('Error durante la autorización de XML:', error);
      throw error;
    }
  }

}
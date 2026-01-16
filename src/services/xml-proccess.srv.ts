import { ENVIRONMENT, VoucherGenerator, type Invoice, type InvoiceResponse } from "facturero-sri-signer";
import {XmlSigner} from "facturero-sri-signer"
import { AuthorizationService } from "facturero-sri-signer";


export class XmlProccessService {

  private voucherGenerator: VoucherGenerator;
  private xmlSigner: XmlSigner;
  private authorizationService: AuthorizationService;

  constructor() {
    this.voucherGenerator = new VoucherGenerator();
    this.xmlSigner = new XmlSigner();
    this.authorizationService = new AuthorizationService();
  }

  async generateInvoiceXML(invoice: Invoice): Promise<InvoiceResponse> {
    return await this.voucherGenerator.generateXmlInvoice(invoice);
  }
  async signXML(cmd: {xmlBuffer: Buffer, p12Buffer: Buffer, password: string}): Promise<string> {
    return await this.xmlSigner.signXml(cmd.p12Buffer, cmd.password, cmd.xmlBuffer);
  }
  async validateXML(xml: Buffer, env: ENVIRONMENT) {
    return await this.authorizationService.validateXml( env, xml);
  }

  async authorizeXML(claveAcceso: string, env: ENVIRONMENT) {
    return await this.authorizationService.authorizeXml( env, claveAcceso); // "test" o "prod"
  }
  
}
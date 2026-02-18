import log4js from "log4js";
import { AuthorizationService, Invoice, VoucherGenerator, XmlInvoiceResponse } from "facturero-sri-signer";
import { AddInvoiceRequest } from "../../dtos/add.invoice.request";
import { SriAuthorizationResult } from "../../dtos/sri.auth.result";
import { SriValidationResult } from "../../dtos/sri.validation.result";
import { SriVoucherResult } from "../../dtos/sri.voucher.result";
import { ENVIRONMENT_TYPE } from "../../enums/environment.type";
import { ISriProccessService } from "../sri.proccess.srv";
import { ENVIRONMENT_ENUM } from "facturero-sri-signer";
import { type SriAuthResponse } from "facturero-sri-signer";
import { InvoiceMapper } from "../../mappers/invoice.mapper";
import { VOUCHER_STATUS } from "../../enums/voucher.status";

export class SriProcessService implements ISriProccessService {
    private readonly logger = log4js.getLogger('SriProcessService');

    private readonly authorizationService: AuthorizationService;
    private readonly voucherGenerator: VoucherGenerator
    constructor() {
        this.authorizationService = new AuthorizationService();
        this.voucherGenerator = new VoucherGenerator();
    }

    async generateInvoiceXML(companyId: string, env: ENVIRONMENT_TYPE, invoice: AddInvoiceRequest): Promise<SriVoucherResult> {

        this.logger.info(`Generating XML for company ${companyId} in environment ${env} with invoice ${invoice}`);
        try {
            const invoiceModel: Invoice = InvoiceMapper.toInvoiceSriModel(invoice);

            invoiceModel.infoTributaria.ambiente = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT_ENUM.PRODUCCION : ENVIRONMENT_ENUM.PRUEBAS;
            invoiceModel.infoTributaria.ruc = companyId;

            const response: XmlInvoiceResponse = await this.voucherGenerator.generateXmlInvoice(invoiceModel);

            return {
                xml: response.xml,
                accessKey: response.accessKey,
                status: VOUCHER_STATUS.GENERATED,
                errors: []
            } as SriVoucherResult;

        } catch (error: any) {
            this.logger.error('Error generating invoice XML: ', error);
            throw error;
        }

    }
    async signXML(cmd: { xmlBuffer: Buffer; p12Buffer: Buffer; password: string; }): Promise<string> {
        this.logger.info(`Signing XML with provided buffers and password`, cmd);
        throw new Error("Method not implemented.");
    }
    async validateXML(env: ENVIRONMENT_TYPE, xml: Buffer): Promise<SriValidationResult> {
        this.logger.info(`Validating XML in environment ${env}, XML size: ${xml.length} bytes`);
        throw new Error("Method not implemented.");
    }
    async authorizeXML(env: ENVIRONMENT_TYPE, accessKey: string,): Promise<SriAuthorizationResult> {

        try {
            const environment = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT_ENUM.PRODUCCION : ENVIRONMENT_ENUM.PRUEBAS;
            const result: SriAuthResponse = await this.authorizationService.authorizeXml(environment, accessKey);

            return {
                status: result.status,
                authorizationDate: result.authorizationDate,
                voucher: result.voucher,
                environment: result.environment === ENVIRONMENT_ENUM.PRODUCCION ? ENVIRONMENT_TYPE.LIVE : ENVIRONMENT_TYPE.TEST,
                sriErrorIdentifier: result.sriErrorIdentifier,
                messages: result.messages || []
            };
        } catch (error: any) {
            this.logger.error('Error en authorizeXML: ', error);
            let status = 'NOT_AUTHORIZED';
            if(error.message?.includes('No se recibió información de autorización')) {
                status = 'PROCESSING';
            }
            return {
                status: status,
                messages: [error?.message || 'Error desconocido durante la autorización']
            } as SriAuthorizationResult;
        }

    }
}
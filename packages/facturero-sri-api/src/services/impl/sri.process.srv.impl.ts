import log4js from "log4js";
import { AuthorizationService } from "facturero-sri-signer";
import { AddInvoiceRequest } from "../../dtos/add.invoice.request";
import { SriAuthorizationResult } from "../../dtos/sri.auth.result";
import { SriValidationResult } from "../../dtos/sri.validation.result";
import { SriVoucherResult } from "../../dtos/sri.voucher.result";
import { ENVIRONMENT_TYPE } from "../../enums/environment.type";
import { ISriProccessService } from "../sri.proccess.srv";
import { ENVIRONMENT } from "facturero-sri-signer";
import { type SriAuthResponse } from "facturero-sri-signer";

export class SriProcessService implements ISriProccessService {
    private readonly logger = log4js.getLogger('SriProcessService');

    private readonly authrizationService: AuthorizationService;
    constructor() {
        this.authrizationService = new AuthorizationService();
    }

    async generateInvoiceXML(companyId: string, env: ENVIRONMENT_TYPE, invoice: AddInvoiceRequest): Promise<SriVoucherResult> {

        this.logger.info(`Generating XML for company ${companyId} in environment ${env} with invoice ${invoice}`);
        throw new Error("Method not implemented.");

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
            const environment = env === ENVIRONMENT_TYPE.LIVE ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;
            const result: SriAuthResponse = await this.authrizationService.authorizeXml(environment, accessKey);

            return {
                status: result.status,
                authorizationDate: result.authorizationDate,
                voucher: result.voucher,
                environment: result.environment === ENVIRONMENT.PRODUCCION ? ENVIRONMENT_TYPE.LIVE : ENVIRONMENT_TYPE.TEST,
                sriErrorIdentifier: result.sriErrorIdentifier,
                messages: result.messages || []
            };
        } catch (error: any) {
            this.logger.error('Error en authorizeXML: ', error);
             return {
                status: 'ERROR',
                messages: [error?.message || 'Error desconocido durante la autorización']
            } as SriAuthorizationResult;
        }

    }
}
import log4js from 'log4js';

import {
    generateXmlInvoice,
    signXml,
    validateXml,
    authorizeXml,
    ComprobanteType,
    SignXmlRequest,
    ResponseGenerateXmlModel,
    ENV_ENUM,
    ValidateXmlResponse,
    ValidateXmlCommand,
    AuthorizeXmlCommand,
    SriAuthorizationResponse,
    SRIAutorizacionError,
} from "osodreamer-sri-xml-signer";

import { AddInvoiceRequest } from "../../dtos/add.invoice.request.js";
import { SriAuthorizationResult } from "../../dtos/sri.auth.result.js";
import { SriValidationResult } from "../../dtos/sri.validation.result.js";
import { VoucherResponse } from "../../dtos/voucher.response.js";
import { ENVIRONMENT_TYPE } from "../../enums/environment.type.js";
import { XmlProccessService } from "../xml.proccess.srv.js";
import { InvoiceMapperOsodreamer } from "../../mappers/invoice.osodreamer.mapper.js";
import { VOUCHER_STATUS } from "../../enums/voucher.status.js";

export class XmlProccessServiceOsoDreamer implements XmlProccessService {

    private readonly logger = log4js.getLogger('XmlProccessServiceOsoDreamer');

    constructor() { }

    async generateInvoiceXML(companyId: string, env: ENVIRONMENT_TYPE, invoice: AddInvoiceRequest): Promise<VoucherResponse> {


        const invoiceModel: ComprobanteType = InvoiceMapperOsodreamer.toInvoiceSriModel(invoice);

        invoiceModel.infoTributaria.ambiente = env === ENVIRONMENT_TYPE.LIVE ? ENV_ENUM.PROD : ENV_ENUM.TEST;
        invoiceModel.infoTributaria.ruc = companyId;

        const response: ResponseGenerateXmlModel = await generateXmlInvoice(invoiceModel);

        return {
            xml: response.generatedXml,
            accessKey: response.invoiceJson.factura.infoTributaria.claveAcceso,
            status: VOUCHER_STATUS.GENERATED,
            errors: []
        } as VoucherResponse;
    }
    async signXML(cmd: { xmlBuffer: Buffer; p12Buffer: Buffer; password: string; }): Promise<string> {


        const signXmlRequest: SignXmlRequest = {
            xmlBuffer: cmd.xmlBuffer,
            p12Buffer: cmd.p12Buffer,
            password: cmd.password
        };
        return await signXml(signXmlRequest);
    }
    async validateXML(env: ENVIRONMENT_TYPE, xml: Buffer): Promise<SriValidationResult> {
        try {
            const validateXmlCommand: ValidateXmlCommand = {
                xml: xml,
                env: env === ENVIRONMENT_TYPE.LIVE ? "prod" : "test"
            };
            const validateXmlResponse: ValidateXmlResponse = await validateXml(validateXmlCommand);

            return {
                status: validateXmlResponse.estado,
                messages: [validateXmlResponse.mensaje || '']
            };
        } catch (error: Error | any) {
            this.logger.error("❌ Error durante la validación SRI:", error);
            return {
                status: 'ERROR',
                sriMessage: error?.mensajeSri || '',
                sriStatus: error?.estado || '',
                sriErrorIdentifier: error?.identificador || '',
                additionalInfo: error?.informacionAdicional || '',
                messages: [error?.message || 'Error desconocido durante la validación']
            } as SriValidationResult;
        }
    }
    async authorizeXML(env: ENVIRONMENT_TYPE, claveAcceso: string): Promise<SriAuthorizationResult> {

        try {
            const authorizeXmlCommand: AuthorizeXmlCommand = {
                claveAcceso: claveAcceso,
                env: env === ENVIRONMENT_TYPE.LIVE ? "prod" : "test"

            };
            const sriAuthorizationResponse: SriAuthorizationResponse = await authorizeXml(authorizeXmlCommand);
            return {
                status: sriAuthorizationResponse.estadoAutorizacion,
                authorizationDate: sriAuthorizationResponse.fechaAutorizacion || '',
                environment: sriAuthorizationResponse.ambiente || '',
                voucher: sriAuthorizationResponse.comprobante || '',
                messages: sriAuthorizationResponse.mensajes ? sriAuthorizationResponse.mensajes.map(m => m.mensaje) : []
            }
        } catch (error: SRIAutorizacionError | any) {
            this.logger.error("❌ Error durante la autorización SRI:", error);
            return {
                status: 'NO_AUTORIZADO',
                authorizationDate: '',
                environment: error?.ambiente || '',
                errorIdentifier: error?.identificador || '',
                sriStatus: error?.estado || '',
                sriMessage: error?.mensajeSri || '',
                additionalInfo: error?.informacionAdicional || '',
                voucher: '',
                messages: [error?.message || 'Error desconocido durante la autorización']
            } as SriAuthorizationResult;
        }
    }

}
import {
    generateXmlInvoice,
    signXml,
    validateXml,
    authorizeXml,
    SRIEnv,
    ComprobanteType,
    SignXmlRequest,
    ResponseGenerateXmlModel,
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

    constructor() { }

    async generateInvoiceXML(companyId: string, env: ENVIRONMENT_TYPE, invoice: AddInvoiceRequest): Promise<VoucherResponse> {


        const invoiceModel: ComprobanteType = InvoiceMapperOsodreamer.toInvoiceSriModel(invoice);

        const response: ResponseGenerateXmlModel = await generateXmlInvoice(invoiceModel);

        return {
            xml: response.generatedXml,
            accessKey: response.invoiceJson.factura.infoTributaria.claveAcceso,
            status: VOUCHER_STATUS.GENERATED,
            errors: []
        } as VoucherResponse;
    }
    signXML(cmd: { xmlBuffer: Buffer; p12Buffer: Buffer; password: string; }): Promise<string> {
        throw new Error("Method not implemented.");
    }
    validateXML(env: ENVIRONMENT_TYPE, xml: Buffer): Promise<SriValidationResult> {
        throw new Error("Method not implemented.");
    }
    authorizeXML(env: ENVIRONMENT_TYPE, claveAcceso: string): Promise<SriAuthorizationResult> {
        throw new Error("Method not implemented.");
    }

}
import log4js from 'log4js';

import { XmlProccessService } from "@services/xml-proccess.srv.js";
import { StorageService } from "@services/storage.srv.js";
import { InvoiceMapper } from '@mappers/invoice.mapper.js';
import { ENVIRONMENT } from 'facturero-sri-signer';


export class InvoiceSriService {

    private readonly logger = log4js.getLogger('InvoiceSriService');


    constructor(
        private readonly _xmlProccessService: XmlProccessService,
        private readonly _storageService: StorageService) {

    }

    /**
     * Ejecuta el flujo completo:
     * 1. Generar XML
     * 2. Firmar XML
     * 3. Validar XML
     * 4. Autorizar comprobante
     */
    executeInvoice = async (companyId: string, env: string, invoiceData: any): Promise<void> => {
        this.logger.info(`🚀 Iniciando proceso de facturación SRI para la empresa: ${companyId} en entorno ${env}`);

        try {

            const ENVIROMENT_TO_EXECUTE = env === 'prod' ? ENVIRONMENT.PRODUCCION : ENVIRONMENT.PRUEBAS;

            invoiceData.factura.ambiente = ENVIROMENT_TO_EXECUTE;
            invoiceData.factura.ruc = companyId;

            const password = invoiceData.factura.signature;

            const invoice = InvoiceMapper.toInvoiceSriModel(invoiceData);

            // === 1. Generar XML ===
            const { xml, jsonObject } =
                await this._xmlProccessService.generateInvoiceXML(invoice);
            const claveAcceso = jsonObject.infoTributaria.claveAcceso as string;

            await this._storageService.writeGeneratedVoucher(companyId,
                claveAcceso,
                Buffer.from(xml));
            this.logger.info(`📄 XML generado correctamente:`);

            this.logger.debug(`reading necessary files for signing and authorization...: claveAcceso: ${claveAcceso}, companyId: ${companyId}`);
            //const p12Buffer = await this._storageService.readCertificateP12(companyId);
            const p12Buffer = await this._storageService.readCertificateP12(companyId);

            const xmlBuffer = await this._storageService.readGeneratedVoucher(companyId, claveAcceso);

            // === 2. Firmar XML ===
            const signedXml = await this._xmlProccessService.signXML({
                p12Buffer: p12Buffer,
                password: password,
                xmlBuffer: xmlBuffer
            });
            await this._storageService.writeSignedVoucher(companyId, claveAcceso, Buffer.from(signedXml));
            this.logger.info(`🔏 XML firmado correctamente:`);


            const signedXmlBuffer = await this._storageService.readSignedVoucher(companyId, claveAcceso);

            // === 3. Validar XML firmado ===
            const validationResult = await this._xmlProccessService.validateXML(
                signedXmlBuffer,
                ENVIROMENT_TO_EXECUTE
            );

            if (!validationResult || validationResult.estado !== 'RECIBIDA') {
                this.logger.error(`❌ Error de validación:`, validationResult);
                throw new Error(`Error de validación SRI: ${JSON.stringify(validationResult)}`);
            }

            this.logger.info(`✅ XML validado correctamente:`);

            this.logger.debug(`Iniciando autorización del comprobante...`);

            // === 4. Autorizar comprobante ===
            const authorization: any = await this._xmlProccessService.authorizeXML(
                claveAcceso,
                ENVIROMENT_TO_EXECUTE
            );

            this.logger.debug(`authorization response: ${JSON.stringify(authorization)}`);

            await this._storageService.writeAuthorizedVoucher(companyId, claveAcceso, Buffer.from(authorization.comprobante));
            this.logger.info(`🧾 Comprobante autorizado correctamente:`);

            this.logger.info("🎉 Proceso completado con éxito.");
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }
    }


}

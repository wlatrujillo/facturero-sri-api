import log4js from 'log4js';
import { ENV_ENUM, type SriAuthorizationResponse } from 'osodreamer-sri-xml-signer';


import { XmlProccessService } from "@services/xml-proccess.srv.js";
import { StorageService } from "@services/storage.srv.js";
import { InvoiceMapper } from '@mappers/invoice.mapper.js';



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

        try {

            invoiceData.factura.ambiente = env === 'prod' ? ENV_ENUM.PROD : ENV_ENUM.TEST;
            invoiceData.factura.tipoEmision = '1';
            invoiceData.factura.ruc = companyId;            
            invoiceData.factura.codDoc = "01"

            const password = invoiceData.factura.signature;

            const invoice = InvoiceMapper.toInvoiceSriModel(invoiceData);



            // === 1. Generar XML ===
            const { generatedXml, invoiceJson } =
                await this._xmlProccessService.generateInvoiceXML(invoice);
            const claveAcceso = invoiceJson.factura.infoTributaria.claveAcceso;

            await this._storageService.writeGeneratedVoucher(companyId,
                claveAcceso,
                Buffer.from(generatedXml));
            this.logger.info(`📄 XML generado correctamente:`);

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

            // === 3. Validar XML firmado ===
            const validationResult = await this._xmlProccessService.validateXML(
                await this._storageService.readSignedVoucher(companyId, claveAcceso),
                env == "prod" ? "prod" : "test"
            );
            this.logger.info(`✅ XML validado correctamente:`);

            // === 4. Autorizar comprobante ===
            const authorization: SriAuthorizationResponse = await this._xmlProccessService.authorizeXML(
                claveAcceso,
                env == "prod" ? "prod" : "test"
            );

            await this._storageService.writeAuthorizedVoucher(companyId, claveAcceso, Buffer.from(authorization.comprobante));
            this.logger.info(`🧾 Comprobante autorizado correctamente:`);

            this.logger.info("🎉 Proceso completado con éxito.");
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }
    }


}

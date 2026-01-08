import fs from 'node:fs';

import { XmlProccessService } from "@services/xml-proccess.srv.js";
import { StorageService } from "@services/storage.srv.js";
import { ENV_ENUM, type SriAuthorizationResponse } from 'osodreamer-sri-xml-signer';
import { InvoiceMapper } from 'mappers/invoice.mapper.js';

export class InvoiceSriService {

    private readonly inputDir = 'generados';
    private readonly signedDir = 'firmados';
    private readonly authorizedDir = 'autorizados';

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

            invoiceData.infoTributaria.tipoEmision = '1';
            invoiceData.infoFactura.ambiente = env === 'prod' ? ENV_ENUM.PROD : ENV_ENUM.TEST;

            const password = 'T818gar005';

            const invoice = InvoiceMapper.toInvoiceSriModel(invoiceData);



            // === 1. Generar XML ===
            const { generatedXml, invoiceJson } =
                await this._xmlProccessService.generateInvoiceXML(invoice);
            const claveAcceso = invoiceJson.factura.infoTributaria.claveAcceso;

            await this._storageService.writeFile(`${companyId}/${this.inputDir}`,
                `${claveAcceso}.xml`,
                Buffer.from(generatedXml));
            console.log(`📄 XML generado correctamente:`);

            const p12File = await this._storageService.readFile('certs', `${companyId}.p12`);

            // === 2. Firmar XML ===
            const signedXml = await this._xmlProccessService.signXML({
                p12Buffer: p12File,
                password: password,
                xmlBuffer: await this._storageService.readFile(`${companyId}/${this.inputDir}`, `${claveAcceso}.xml`),
            });
            await this._storageService.writeFile(`${companyId}/${this.signedDir}`, `${claveAcceso}.xml`, Buffer.from(signedXml));
            console.log(`🔏 XML firmado correctamente: ${this.signedDir}/${claveAcceso}.xml`);

            // === 3. Validar XML firmado ===
            const validationResult = await this._xmlProccessService.validateXML(
                await this._storageService.readFile(`${companyId}/${this.signedDir}`, `${claveAcceso}.xml`),
                "test"
            );
            console.log("✅ Validación completada:", validationResult);

            // === 4. Autorizar comprobante ===
            const authorization: SriAuthorizationResponse = await this._xmlProccessService.authorizeXML(
                claveAcceso,
                "test"
            );

            await this._storageService.writeFile(`${companyId}/${this.authorizedDir}`,
                `${claveAcceso}.xml`,
                Buffer.from(authorization.comprobante));
            console.log(`🧾 Comprobante autorizado: ${this.authorizedDir}/${claveAcceso}.xml`);

            console.log("🎉 Proceso completado con éxito.");
        } catch (error) {
            console.error("❌ Error durante el proceso:", error);
        }
    }


}

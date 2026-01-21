import log4js from 'log4js';

import { type XmlProccessService } from '@services/xml.proccess.srv.js';
import type { VoucherServiceSri } from '@services/voucher.srv.sri.js';
import type { StorageService } from '@services/storage.srv.js';
import type { ValidationResult } from '@dtos/validation.result.js';
import type { ENVIROMENT_TYPE } from '@enums/enviroment.type.js';
import type { InvoiceDTO } from '@dtos/invoice.dto.js';
import type { CompanyRepository } from '@repository/company.repository.js';
import type { VoucherRepository } from '@repository/voucher.repository.js';
import { VoucherStatus } from '@enums/voucher.status.js';

export class VoucherServiceSriImpl implements VoucherServiceSri {
    private readonly logger = log4js.getLogger('VoucherServiceSriImpl');
    constructor(
        private readonly _xmlProccessService: XmlProccessService,
        private readonly _companyRepository: CompanyRepository,
        private readonly _voucherRepository: VoucherRepository,
        private readonly _storageService: StorageService
    ) { }

    /**
     * Ejecuta el flujo completo:
     * 1. Generar XML
     * 2. Firmar XML
     * 3. Validar XML
     * 4. Autorizar comprobante
     */
    executeInvoice = async (companyId: string, enviromentType: ENVIROMENT_TYPE, invoiceData: InvoiceDTO): Promise<void> => {
        this.logger.info(`🚀 Iniciando proceso de facturación SRI para la empresa: ${companyId} en entorno ${enviromentType}`);

        try {

            this.logger.debug(`Fetching company data for companyId: ${companyId}`);
            const company = await this._companyRepository.findById({ companyId });
            if (!company) {
                throw new Error(`Company with ID ${companyId} not found.`);
            }

            // TO-DO: Retrieve password securely
            const password = company.signaturePassword;

            // === 1. Generar XML ===
            const { xml, accessKey } =
                await this._xmlProccessService.generateInvoiceXML(companyId, invoiceData, enviromentType);
            const claveAcceso = accessKey as string;

            await this._storageService.writeGeneratedVoucher(companyId,
                claveAcceso,
                Buffer.from(xml));

            this._voucherRepository.insert({
                companyId: companyId,
                key: claveAcceso,
                xml: xml,
                status: VoucherStatus.GENERATED,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            this.logger.info(`📄 XML generado correctamente:`);

            this.logger.debug(`reading necessary files for signing and authorization...: claveAcceso: ${claveAcceso}, companyId: ${companyId}`);

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
            const validationResult : ValidationResult = await this._xmlProccessService.validateXML(
                signedXmlBuffer,
                enviromentType
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
                enviromentType
            );

            this.logger.debug(`authorization response: ${JSON.stringify(authorization)}`);


            if (!authorization || authorization.estado !== 'AUTORIZADO') {
                this.logger.error(`❌ Error de autorización:`, authorization);
                throw new Error(`Error de autorización SRI: ${JSON.stringify(authorization)}`);
            }


            await this._storageService.writeAuthorizedVoucher(companyId, claveAcceso, Buffer.from(authorization.comprobante));

            this.logger.info(`🧾 Comprobante autorizado correctamente:`);

            this.logger.info("🎉 Proceso completado con éxito.");
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }
    }

    authorizeVoucher = async (companyId: string, enviromentType: ENVIROMENT_TYPE, accessKey: string): Promise<void> => {
        this.logger.info(`🚀 Iniciando proceso de autorización SRI para la empresa: ${companyId} en entorno ${enviromentType} con clave de acceso: ${accessKey}`);
        try {

            this.logger.debug(`Iniciando autorización del comprobante...`);

            // === 4. Autorizar comprobante ===
            const authorization: any = await this._xmlProccessService.authorizeXML(
                accessKey,
                enviromentType
            );

            this.logger.debug(`authorization response: ${JSON.stringify(authorization)}`);

            if (!authorization || authorization.estado !== 'AUTORIZADO') {
                this.logger.error(`❌ Error de autorización:`, authorization);
                throw new Error(`Error de autorización SRI: ${JSON.stringify(authorization)}`);
            }

            await this._storageService.writeAuthorizedVoucher(companyId, accessKey, Buffer.from(authorization.comprobante));

            this.logger.info(`🧾 Comprobante autorizado correctamente:`);
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }
    }


}

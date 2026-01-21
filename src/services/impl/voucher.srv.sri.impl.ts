import log4js from 'log4js';

import { type XmlProccessService } from '@services/xml.proccess.srv.js';
import type { VoucherServiceSri } from '@services/voucher.srv.sri.js';
import type { StorageService } from '@services/storage.srv.js';
import type { ValidationResult } from '@dtos/validation.result.js';
import type { ENVIRONMENT_TYPE } from '@enums/environment.type.js';
import type { InvoiceDTO } from '@dtos/invoice.dto.js';
import type { CompanyRepository } from '@repository/company.repository.js';
import type { VoucherRepository } from '@repository/voucher.repository.js';
import { VOUCHER_STATUS } from '@enums/voucher.status.js';
import { VOUCHER_TYPE } from '@enums/voucher.type.js';
import type { IVoucherKey } from '@model/voucher.key.js';

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
    executeInvoice = async (companyId: string, environmentType: ENVIRONMENT_TYPE, invoiceData: InvoiceDTO): Promise<void> => {
        this.logger.info(`🚀 Iniciando proceso de facturación SRI para la empresa: ${companyId} en entorno ${environmentType}`);

        try {

            this.logger.debug(`Fetching company data for companyId: ${companyId}`);
            const company = await this._companyRepository.findById({ companyId });
            if (!company) {
                throw new Error(`Company with ID ${companyId} not found.`);
            }

            const voucherKey: IVoucherKey = {
                companyId: companyId,
                voucherType: VOUCHER_TYPE.INVOICE,
                sequence: invoiceData.factura.secuencial
            };

            let voucherGenerated = await this._voucherRepository.findById(voucherKey, environmentType);

            if (!voucherGenerated) {
                this.logger.debug(`No existing voucher found. Generating new XML for invoice sequence: ${invoiceData.factura.secuencial}`);
                // === 1. Generar XML ===
                const { xml, accessKey } =
                    await this._xmlProccessService.generateInvoiceXML(companyId, invoiceData, environmentType);
                const claveAcceso = accessKey as string;

                await this._storageService.writeGeneratedVoucher(companyId,
                    claveAcceso,
                    Buffer.from(xml));

                voucherGenerated = await this._voucherRepository.insert({
                    companyId: companyId,
                    key: `#${VOUCHER_TYPE.INVOICE}#${invoiceData.factura.secuencial}`,
                    accessKey: claveAcceso,
                    xml: xml,
                    status: VOUCHER_STATUS.GENERATED,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }, environmentType);

                this.logger.info(`📄 XML generado correctamente:`);
            }

            if (voucherGenerated.status === VOUCHER_STATUS.GENERATED) {
                this.logger.debug(`Signing XML for accessKey: ${voucherGenerated.accessKey}`);
                // === 2. Firmar XML ===∏fo

                // TO-DO: Retrieve password securely
                const password = company.signaturePassword;

                const p12Buffer = await this._storageService.readCertificateP12(companyId);

                const xmlBuffer = await this._storageService.readGeneratedVoucher(companyId, voucherGenerated.accessKey || '');


                const signedXml = await this._xmlProccessService.signXML({
                    p12Buffer: p12Buffer,
                    password: password,
                    xmlBuffer: xmlBuffer
                });
                await this._storageService.writeSignedVoucher(companyId, voucherGenerated.accessKey || '', Buffer.from(signedXml));

                await this._voucherRepository.updateStatus(
                    voucherKey,
                    VOUCHER_STATUS.SIGNED,
                    environmentType);

                voucherGenerated.status = VOUCHER_STATUS.SIGNED;

                this.logger.info(`🔏 XML firmado correctamente:`);
            }


            if (voucherGenerated.status === VOUCHER_STATUS.SIGNED) {

                // === 3. Validar XML firmado ===
                const signedXmlBuffer = await this._storageService.readSignedVoucher(companyId, voucherGenerated.accessKey || '');


                const validationResult: ValidationResult = await this._xmlProccessService.validateXML(
                    signedXmlBuffer,
                    environmentType
                );

                if (!validationResult || validationResult.estado !== 'RECIBIDA') {
                    this.logger.error(`❌ Error de validación:`, validationResult);
                    throw new Error(`Error de validación SRI: ${JSON.stringify(validationResult)}`);
                }

                await this._voucherRepository.updateStatus(voucherKey, VOUCHER_STATUS.VALIDATED, environmentType);

                voucherGenerated.status = VOUCHER_STATUS.VALIDATED;

                this.logger.info(`✅ XML validado correctamente:`);
            }

            if (voucherGenerated.status === VOUCHER_STATUS.VALIDATED) {

                // === 4. Autorizar comprobante ===
                const authorization: any = await this._xmlProccessService.authorizeXML(
                    voucherGenerated.accessKey || '',
                    environmentType
                );

                this.logger.debug(`authorization response: ${JSON.stringify(authorization)}`);


                if (!authorization || authorization.estado !== 'AUTORIZADO') {
                    this.logger.error(`❌ Error de autorización:`, authorization);
                    throw new Error(`Error de autorización SRI: ${JSON.stringify(authorization)}`);
                }

                await this._storageService.writeAuthorizedVoucher(companyId, voucherGenerated.accessKey || '', Buffer.from(authorization.comprobante));

                await this._voucherRepository.updateStatus(voucherKey, VOUCHER_STATUS.AUTHORIZED, environmentType);

                voucherGenerated.status = VOUCHER_STATUS.AUTHORIZED;

                this.logger.info(`🧾 Comprobante autorizado correctamente:`);
            }

            this.logger.info("🎉 Proceso completado con éxito.");
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }
    }

    authorizeVoucher = async (companyId: string, environmentType: ENVIRONMENT_TYPE, accessKey: string): Promise<void> => {
        this.logger.info(`🚀 Iniciando proceso de autorización SRI para la empresa: ${companyId} en entorno ${environmentType} con clave de acceso: ${accessKey}`);
        try {

            this.logger.debug(`Iniciando autorización del comprobante...`);

            // === 4. Autorizar comprobante ===
            const authorization: any = await this._xmlProccessService.authorizeXML(
                accessKey,
                environmentType
            );

            this.logger.debug(`authorization response: ${JSON.stringify(authorization)}`);

            if (!authorization || authorization.estado !== 'AUTORIZADO') {
                this.logger.error(`❌ Error de autorización:`, authorization);
                throw new Error(`Error de autorización SRI: ${JSON.stringify(authorization)}`);
            }

            await this._storageService.writeAuthorizedVoucher(companyId, accessKey, Buffer.from(authorization.comprobante));


            await this._voucherRepository.updateStatus({
                companyId: companyId,
                voucherType: VOUCHER_TYPE.INVOICE,
                sequence: '' // TO-DO: Extract sequence from accessKey or pass it as parameter
            }, VOUCHER_STATUS.AUTHORIZED, environmentType);

            this.logger.info(`🧾 Comprobante autorizado correctamente:`);
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }
    }


}

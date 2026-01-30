import log4js from 'log4js';

import { type XmlProccessService } from '../../services/xml.proccess.srv.js';
import type { VoucherServiceSri } from '../../services/voucher.srv.sri.js';
import type { StorageService } from '../../services/storage.srv.js';
import type { SriValidationResult } from '../../dtos/sri.validation.result.js';
import { ENVIRONMENT_TYPE } from '../../enums/environment.type.js';
import type { AddInvoiceRequest } from '../../dtos/add.invoice.request.js';
import type { CompanyRepository } from '../../repository/company.repository.js';
import { VoucherRepository } from '../../repository/voucher.repository.js';
import { VOUCHER_STATUS } from '../../enums/voucher.status.js';
import { VOUCHER_TYPE } from '../../enums/voucher.type.js';
import type { IVoucherKey } from '../../model/voucher.key.js';
import { AddVoucherException } from '../../exceptions/add.voucher.exception.js';
import type { AddVoucherResponse } from '../../dtos/add.voucher.response.js';
import type { AuthVoucherResponse } from '../../dtos/auth.voucher.response.js';
import type { SriAuthorizationResult } from '../../dtos/sri.auth.result.js';
import { IVoucher } from '../../model/voucher.js';
import { VoucherResponse } from '../../dtos/voucher.response.js';

export class VoucherServiceSriImpl implements VoucherServiceSri {
    private readonly logger = log4js.getLogger('VoucherServiceSriImpl');
    constructor(
        private readonly _xmlProccessService: XmlProccessService,
        private readonly _companyRepository: CompanyRepository,
        private readonly _voucherRepository: VoucherRepository,
        private readonly _storageService: StorageService,
    ) { }

    /**
     * Ejecuta el flujo completo:
     * 1. Generar XML
     * 2. Firmar XML
     * 3. Validar XML
     * 4. Autorizar comprobante
     */
    executeInvoice = async (companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<AddVoucherResponse> => {
        this.logger.info(`🚀 Iniciando proceso de facturación SRI para la empresa: ${companyId} en entorno ${env}`);


        try {

            const voucherKey: IVoucherKey = {
                companyId: companyId,
                voucherType: VOUCHER_TYPE.INVOICE,
                establishment: invoiceData.factura.estab,
                branch: invoiceData.factura.ptoEmi,
                sequence: invoiceData.factura.secuencial
            };

            let voucherGenerated: IVoucher = await this._voucherRepository.findById(voucherKey) as IVoucher;

            if (!voucherGenerated) {
                // === 1. Generar XML ===
                this.logger.debug(`No existing voucher found. Generating new XML for invoice sequence: ${invoiceData.factura.secuencial}`);

                const { xml, accessKey } =
                    await this._xmlProccessService.generateInvoiceXML(companyId, env, invoiceData);
                const claveAcceso = accessKey as string;

                await this._storageService.writeGeneratedVoucher(companyId,
                    claveAcceso,
                    Buffer.from(xml));

                voucherGenerated = await this._voucherRepository.insert({
                    companyId: companyId,
                    voucherId: `#${VOUCHER_TYPE.INVOICE}#${invoiceData.factura.estab}#${invoiceData.factura.ptoEmi}#${invoiceData.factura.secuencial}`,
                    accessKey: claveAcceso,
                    xml: xml,
                    status: VOUCHER_STATUS.GENERATED,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });


                voucherGenerated.status = VOUCHER_STATUS.GENERATED;

                this.logger.info(`📄 XML generado correctamente:`);
            }

            if (voucherGenerated.status === VOUCHER_STATUS.GENERATED) {
                // === 2. Firmar XML ===
                this.logger.debug(`Signing XML for accessKey: ${voucherGenerated.accessKey}`);

                const company = await this._companyRepository.findById({ companyId });
                if (!company) {
                    throw new Error(`Company with ID ${companyId} not found.`);
                }
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
                    '',
                    [],
                    signedXml
                );

                voucherGenerated.status = VOUCHER_STATUS.SIGNED;

                this.logger.info(`🔏 XML firmado correctamente:`);
            }


            if (voucherGenerated.status === VOUCHER_STATUS.SIGNED || voucherGenerated.status === VOUCHER_STATUS.REJECTED) {
                // === 3. Validar XML firmado ===
                this.logger.debug(`Validating XML for accessKey: ${voucherGenerated.accessKey}`);

                const signedXmlBuffer = await this._storageService.readSignedVoucher(companyId, voucherGenerated.accessKey || '');


                const validationSriResult: SriValidationResult = await this._xmlProccessService.validateXML(
                    env,
                    signedXmlBuffer
                );

                if (!validationSriResult || validationSriResult.status !== 'RECIBIDA') {

                    await this._voucherRepository.updateStatus(
                        voucherKey,
                        VOUCHER_STATUS.REJECTED,
                        validationSriResult.status,
                        validationSriResult.messages
                    );


                    return {
                        accessKey: voucherGenerated.accessKey || '',
                        status: VOUCHER_STATUS.REJECTED,
                        errors: validationSriResult.messages || []
                    } as AddVoucherResponse;

                }

                await this._voucherRepository.updateStatus(voucherKey,
                    VOUCHER_STATUS.VALIDATED,
                    validationSriResult.status,
                    validationSriResult.messages
                );
                voucherGenerated.status = VOUCHER_STATUS.VALIDATED;

                this.logger.info(`✅ XML validado correctamente:`);

            }

            if (voucherGenerated.status === VOUCHER_STATUS.VALIDATED || voucherGenerated.status === VOUCHER_STATUS.NOT_AUTHORIZED) {
                // === 4. Autorizar comprobante ===
                this.logger.debug(`Authorizing voucher for accessKey: ${voucherGenerated.accessKey}`);

                const authorizationResult: SriAuthorizationResult = await this._xmlProccessService.authorizeXML(
                    env,
                    voucherGenerated.accessKey || ''
                );


                this.logger.debug(`authorizationResult response: ${JSON.stringify(authorizationResult)}`);

                if (!authorizationResult || authorizationResult.status !== 'AUTORIZADO') {

                    await this._voucherRepository.updateStatus(voucherKey,
                        VOUCHER_STATUS.NOT_AUTHORIZED,
                        authorizationResult.status,
                        authorizationResult.messages);

                    return {
                        accessKey: voucherGenerated.accessKey || '',
                        status: VOUCHER_STATUS.NOT_AUTHORIZED,
                        errors: authorizationResult.messages || []
                    }
                }

                await this._storageService.writeAuthorizedVoucher(companyId, voucherGenerated.accessKey || '', Buffer.from(authorizationResult.voucher));
                await this._voucherRepository.updateStatus(voucherKey, VOUCHER_STATUS.AUTHORIZED,
                    authorizationResult.status,
                    authorizationResult.messages,
                    authorizationResult.voucher);

                this.logger.info(`🧾 Comprobante autorizado correctamente:`);

            }

            this.logger.info("🎉 Proceso completado con éxito.");

            return { accessKey: voucherGenerated.accessKey || '', status: VOUCHER_STATUS.AUTHORIZED, errors: [] } as AddVoucherResponse;

        } catch (error: any) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw new AddVoucherException(`Error en el proceso de facturación SRI: ${error?.message}`);
        }


    }

    async generateSignedInvoice(companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<string> {

        const voucherResponse: VoucherResponse = await this._xmlProccessService.generateInvoiceXML(companyId, env, invoiceData);

        const xml = voucherResponse.xml;

        const signedXml: string = await this._xmlProccessService.signXML({
            p12Buffer: await this._storageService.readCertificateP12(companyId),
            password: (await this._companyRepository.findById({ companyId }))?.signaturePassword || '',
            xmlBuffer: Buffer.from(xml)
        });
        return signedXml;
    }

    authorizeVoucher = async (companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<AuthVoucherResponse> => {
        this.logger.info(`🚀 Iniciando proceso de autorización SRI para la empresa: ${companyId} en entorno ${env} con clave de acceso: ${accessKey}`);
        try {

            this.logger.debug(`Iniciando autorización del comprobante...`);

            // TOD-DO: Get voucher from repository to check its current status

            const voucherKey: IVoucherKey = this.getVoucherKeyFromAccessKey(accessKey);

            await this._voucherRepository.findById(voucherKey);

            // === 4. Autorizar comprobante ===
            const authorization: any = await this._xmlProccessService.authorizeXML(
                env,
                accessKey
            );

            this.logger.debug(`authorization response: ${JSON.stringify(authorization)}`);

            if (!authorization || authorization.estado !== 'AUTORIZADO') {
                this.logger.error(`❌ Error de autorización:`, authorization);
                throw new AddVoucherException(`Error de autorización SRI: ${JSON.stringify(authorization)}`);
            }

            await this._storageService.writeAuthorizedVoucher(companyId, accessKey, Buffer.from(authorization.comprobante));


            await this._voucherRepository.updateStatus({
                companyId: companyId,
                voucherType: voucherKey.voucherType,
                branch: voucherKey.branch,
                establishment: voucherKey.establishment,
                sequence: voucherKey.sequence
            }, VOUCHER_STATUS.AUTHORIZED);

            this.logger.info(`🧾 Comprobante autorizado correctamente:`);
            return { accessKey: accessKey, status: VOUCHER_STATUS.AUTHORIZED, errors: [] } as AuthVoucherResponse;
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }

    }

    private getVoucherKeyFromAccessKey = (accessKey: string): IVoucherKey => {

        const voucherTypeCode = accessKey.substring(8, 10);
        const companyId = accessKey.substring(10, 24);
        const estab = accessKey.substring(25, 28);
        const ptoEmi = accessKey.substring(28, 31);
        const secuencial = accessKey.substring(31, 40);

        return {
            companyId: companyId,
            voucherType: voucherTypeCode,
            establishment: estab,
            branch: ptoEmi,
            sequence: secuencial
        } as IVoucherKey;
    }


}

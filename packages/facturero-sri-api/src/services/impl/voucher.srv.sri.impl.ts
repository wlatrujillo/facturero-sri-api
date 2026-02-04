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
import type { IVoucherId } from '../../model/voucher.id.js';
import { AddVoucherException } from '../../exceptions/add.voucher.exception.js';
import type { AddVoucherResponse } from '../../dtos/add.voucher.response.js';
import type { AuthVoucherResponse } from '../../dtos/auth.voucher.response.js';
import type { SriAuthorizationResult } from '../../dtos/sri.auth.result.js';
import { IVoucher } from '../../model/voucher.js';
import { VoucherResponse } from '../../dtos/voucher.response.js';
import { SigningVoucherException } from '../../exceptions/signing.voucher.exception.js';
import { ValidationVoucherException } from '../../exceptions/validation.voucher.exception.js';
import { AuthorizationVoucherException } from '../../exceptions/authorization.voucher.exception.js';
import { GetVoucherResponse } from '../../dtos/get.voucher.response.js';
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

        try {

            const voucherId: IVoucherId = {
                voucherType: VOUCHER_TYPE.INVOICE,
                establishment: invoiceData.factura.estab,
                branch: invoiceData.factura.ptoEmi,
                sequence: invoiceData.factura.secuencial
            };

            let voucherGenerated: IVoucher = await this._voucherRepository.findById(companyId, voucherId) as IVoucher;

            if (voucherGenerated && voucherGenerated.status === VOUCHER_STATUS.AUTHORIZED) {
                this.logger.info(`El comprobante con clave de acceso ${voucherGenerated.accessKey} ya se encuentra autorizado.`);
                return {
                    accessKey: voucherGenerated.accessKey,
                    status: voucherGenerated.status,
                    messages: ["El comprobante ya se encuentra autorizado."]
                } as AddVoucherResponse;
            }

            this.logger.info(`🚀 Iniciando proceso de facturación SRI para la empresa: ${companyId} en entorno ${env}`);

            if (!voucherGenerated || voucherGenerated.status === VOUCHER_STATUS.REJECTED || voucherGenerated.status === VOUCHER_STATUS.NOT_AUTHORIZED) {

                // === 1. Generar XML  ===
                this.logger.debug(`1. Generating XML for invoice...`);
                const voucherResponse: VoucherResponse = await this._xmlProccessService.generateInvoiceXML(companyId, env, invoiceData);

                if (!voucherResponse || !voucherResponse.xml || !voucherResponse.accessKey) {
                    throw new SigningVoucherException("Error generating signed XML voucher.");
                }

                // === 2. Firmar XML  ===
                this.logger.debug(`2. Signing XML for voucher with accessKey: ${voucherResponse.accessKey}`);
                const company = await this._companyRepository.findById({ companyId });

                if (!company) {
                    throw new SigningVoucherException(`Company with ID ${companyId} not found.`);
                }

                const p12Buffer = await this._storageService.readCertificateP12(companyId);

                // TO-DO: Retrieve password securely
                const password = company.signaturePassword;

                const signedXml: string = await this._xmlProccessService.signXML({
                    p12Buffer: p12Buffer,
                    password: password,
                    xmlBuffer: Buffer.from(voucherResponse.xml)
                });

                await this._storageService.writeSignedVoucher(
                    companyId,
                    voucherResponse.accessKey || '',
                    Buffer.from(signedXml)
                );

                if (!voucherGenerated) {
                    voucherGenerated = await this._voucherRepository.insert({
                        companyId: companyId,
                        voucherId: voucherId,
                        accessKey: voucherResponse.accessKey,
                        xml: signedXml,
                        status: VOUCHER_STATUS.SIGNED,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    voucherGenerated.xml = signedXml;
                    voucherGenerated.status = VOUCHER_STATUS.SIGNED;
                    voucherGenerated.updatedAt = new Date().toISOString();
                    voucherGenerated.accessKey = voucherResponse.accessKey;
                    await this._voucherRepository.update(companyId, voucherId,
                        {
                            xml: signedXml,
                            status: VOUCHER_STATUS.SIGNED,
                            accessKey: voucherResponse.accessKey,
                            updatedAt: voucherGenerated.updatedAt
                        } as IVoucher);
                }


            }


            if (voucherGenerated.status == VOUCHER_STATUS.REJECTED || voucherGenerated.status == VOUCHER_STATUS.SIGNED) {
                // === 3. Validar XML firmado ===
                this.logger.debug(`3. Validating XML for accessKey: ${voucherGenerated.accessKey}`);

                const signedXml: Buffer = await this._storageService.readSignedVoucher(
                    companyId,
                    voucherGenerated.accessKey || ''
                );

                const validationSriResult: SriValidationResult = await this._xmlProccessService.validateXML(
                    env,
                    signedXml
                );

                if (validationSriResult && validationSriResult.sriErrorIdentifier == '70') {

                    await this._voucherRepository.update(
                        companyId,
                        voucherId,
                        {
                            status: VOUCHER_STATUS.PROCESSING,
                            sriStatus: validationSriResult.sriMessage,
                            sriErrorIdentifier: validationSriResult.sriErrorIdentifier,
                            messages: validationSriResult.messages || []
                        } as IVoucher
                    );

                    voucherGenerated.status = VOUCHER_STATUS.PROCESSING;

                    this.logger.error(`❌ Error de validación:`, validationSriResult);

                    throw new ValidationVoucherException(`Voucher validation failed`, validationSriResult.messages);
                }

                if (!validationSriResult || validationSriResult.status !== 'RECIBIDA') {

                    await this._voucherRepository.update(
                        companyId,
                        voucherId,
                        {
                            status: VOUCHER_STATUS.REJECTED,
                            sriStatus: validationSriResult ? validationSriResult.sriMessage : 'Unknown validation error',
                            sriErrorIdentifier: validationSriResult ? validationSriResult.sriErrorIdentifier : 'Unknown',
                            messages: validationSriResult ? validationSriResult.messages || [] : ['Unknown validation error']
                        } as IVoucher
                    );

                    throw new ValidationVoucherException(`Voucher validation failed`, validationSriResult.messages);

                }

                await this._voucherRepository.update(
                    companyId,
                    voucherId,
                    {
                        status: VOUCHER_STATUS.RECEIVED,
                        sriStatus: validationSriResult.sriMessage,
                        sriErrorIdentifier: validationSriResult.sriErrorIdentifier,
                        messages: validationSriResult.messages || []
                    } as IVoucher
                );

                voucherGenerated.status = VOUCHER_STATUS.RECEIVED;

            }

            if (voucherGenerated.status == VOUCHER_STATUS.RECEIVED || voucherGenerated.status == VOUCHER_STATUS.PROCESSING) {

                // === 4. Autorizar comprobante ===
                this.logger.debug(`4. Authorizing voucher for accessKey: ${voucherGenerated.accessKey}`);

                const authorizationResult: SriAuthorizationResult = await this._xmlProccessService.authorizeXML(
                    env,
                    voucherGenerated.accessKey || ''
                );

                if (authorizationResult && authorizationResult.sriErrorIdentifier == '56') {
                    this._voucherRepository.update(
                        companyId,
                        voucherId,
                        {
                            status: VOUCHER_STATUS.NOT_AUTHORIZED,
                            sriStatus: authorizationResult.sriMessage || '',
                            sriErrorIdentifier: authorizationResult.sriErrorIdentifier || '',
                            messages: authorizationResult.messages || []
                        } as IVoucher
                    );

                    voucherGenerated.status = VOUCHER_STATUS.NOT_AUTHORIZED;

                    this.logger.error(`❌ Error de autorización:`, authorizationResult);

                    throw new AuthorizationVoucherException(`Voucher authorization failed`, authorizationResult.messages);
                }


                if (!authorizationResult || authorizationResult.status !== 'AUTORIZADO') {

                    this.logger.error(`❌ Error de autorización:`, authorizationResult);

                    throw new AuthorizationVoucherException(`Voucher authorization failed`, authorizationResult.messages);
                }

                await this._storageService.writeAuthorizedVoucher(
                    companyId,
                    voucherGenerated.accessKey || '',
                    Buffer.from(authorizationResult.voucher));

                await this._voucherRepository.update(
                    companyId,
                    voucherId,
                    {
                        status: VOUCHER_STATUS.AUTHORIZED,
                        sriStatus: authorizationResult.sriMessage || '',
                        sriErrorIdentifier: authorizationResult.sriErrorIdentifier || '',
                        messages: authorizationResult.messages || []
                    } as IVoucher
                );

                voucherGenerated.status = VOUCHER_STATUS.AUTHORIZED;

                this.logger.info(`🧾 Comprobante autorizado correctamente: ${voucherGenerated.accessKey}`);
            }


            this.logger.info("🎉 Proceso completado con éxito.");

            return {
                accessKey: voucherGenerated.accessKey,
                status: voucherGenerated.status,
                messages: []
            } as AddVoucherResponse;

        } catch (error: any) {
            throw error;
        }


    }

    generateSignedInvoice = async (companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<VoucherResponse> => {
        this.logger.debug(`Signing XML for invoice for companyId: ${companyId} environment: ${env}`);

        const voucherResponse: VoucherResponse = await this._xmlProccessService.generateInvoiceXML(companyId, env, invoiceData);

        const xml = voucherResponse.xml;

        this.logger.debug(`Generated XML: ${xml.substring(0, 100)}...`);

        const p12Buffer = await this._storageService.readCertificateP12(companyId);

        const company = await this._companyRepository.findById({ companyId });

        if (!company) {
            throw new Error(`Company with ID ${companyId} not found.`);
        }

        // TO-DO: Retrieve password securely
        const password = company.signaturePassword;

        const signedXml: string = await this._xmlProccessService.signXML({
            p12Buffer: p12Buffer,
            password: password,
            xmlBuffer: Buffer.from(xml)
        });
        return { xml: signedXml, accessKey: voucherResponse.accessKey, status: VOUCHER_STATUS.SIGNED, errors: [] } as VoucherResponse;
    }

    authorizeVoucher = async (companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<AuthVoucherResponse> => {
        this.logger.info(`🚀 Iniciando proceso de autorización SRI para la empresa: ${companyId} en entorno ${env} con clave de acceso: ${accessKey}`);
        try {

            this.logger.debug(`Iniciando autorización del comprobante...`);

            // TOD-DO: Get voucher from repository to check its current status

            const voucherId: IVoucherId = this.getVoucherKeyFromAccessKey(accessKey);

            await this._voucherRepository.findById(companyId, voucherId);

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


            await this._voucherRepository.update(companyId, voucherId, { status: VOUCHER_STATUS.AUTHORIZED } as IVoucher);

            this.logger.info(`🧾 Comprobante autorizado correctamente:`);
            return { accessKey: accessKey, status: VOUCHER_STATUS.AUTHORIZED, messages: [] } as AuthVoucherResponse;
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }

    }

    getVoucherStatusByVoucherId = async (companyId: string, voucherId: IVoucherId): Promise<GetVoucherResponse> => {
        const voucher = await this._voucherRepository.findById(companyId, voucherId);
        return {
            accessKey: voucher?.accessKey || undefined,
            status: voucher?.status || undefined,
        } as GetVoucherResponse;
    }

    private getVoucherKeyFromAccessKey = (accessKey: string): IVoucherId => {

        const voucherTypeCode = accessKey.substring(8, 10);
        const estab = accessKey.substring(25, 28);
        const ptoEmi = accessKey.substring(28, 31);
        const secuencial = accessKey.substring(31, 40);

        return {
            voucherType: voucherTypeCode,
            establishment: estab,
            branch: ptoEmi,
            sequence: secuencial
        } as IVoucherId;
    }


}

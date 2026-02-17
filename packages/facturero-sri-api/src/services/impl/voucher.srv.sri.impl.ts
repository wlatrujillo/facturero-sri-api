import log4js from 'log4js';

import { type SriProccessService } from '../sri.proccess.srv.js';
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
import type { SriAuthorizationResult } from '../../dtos/sri.auth.result.js';
import { IVoucher } from '../../model/voucher.js';
import { SriVoucherResult } from '../../dtos/sri.voucher.result.js';
import { SigningVoucherException } from '../../exceptions/signing.voucher.exception.js';
import { ValidationVoucherException } from '../../exceptions/validation.voucher.exception.js';
import { AuthorizationVoucherException } from '../../exceptions/authorization.voucher.exception.js';
import { GetVoucherResponse } from '../../dtos/get.voucher.response.js';
export class VoucherServiceSriImpl implements VoucherServiceSri {
    private readonly logger = log4js.getLogger('VoucherServiceSriImpl');
    constructor(
        private readonly _sriProccessService: SriProccessService,
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

            if (!voucherGenerated) {
                voucherGenerated = await this._voucherRepository.insert({
                    companyId: companyId,
                    voucherId: voucherId,
                    accessKey: '',
                    xml: '',
                    status: VOUCHER_STATUS.INITIAL,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            if (voucherGenerated.status === VOUCHER_STATUS.AUTHORIZED) {
                this.logger.info(`El comprobante con clave de acceso ${voucherGenerated.accessKey} ya se encuentra autorizado.`);
                return {
                    accessKey: voucherGenerated.accessKey,
                    status: voucherGenerated.status,
                    messages: ["El comprobante ya se encuentra autorizado."]
                } as AddVoucherResponse;
            }


            this.logger.info(`🚀 Iniciando proceso de facturación SRI para la empresa: ${companyId} en entorno ${env}`);
            // === 1. Generar XML  ===
            if (voucherGenerated.status === VOUCHER_STATUS.INITIAL ||
                voucherGenerated.status === VOUCHER_STATUS.REJECTED ||
                voucherGenerated.status === VOUCHER_STATUS.NOT_AUTHORIZED) {
                this.logger.debug(`1. Generating XML for invoice...`);
                const sriVoucherResult: SriVoucherResult = await this.generateInvoiceXML(companyId, env, invoiceData);
                voucherGenerated.accessKey = sriVoucherResult.accessKey;
                voucherGenerated.xml = sriVoucherResult.xml;
                voucherGenerated.status = VOUCHER_STATUS.GENERATED;
            }
            // === 2. Firmar XML  ===
            if (voucherGenerated.status === VOUCHER_STATUS.GENERATED) {
                this.logger.debug(`2. Signing XML for voucher with accessKey: ${voucherGenerated.accessKey}`);
                const signedXml = await this.signVoucher(companyId, voucherGenerated.accessKey || '');
                voucherGenerated.xml = signedXml;
                voucherGenerated.status = VOUCHER_STATUS.SIGNED;
            }
            // === 3. Validar XML firmado ===
            if (voucherGenerated.status == VOUCHER_STATUS.SIGNED) {
                this.logger.debug(`3. Validating XML for accessKey: ${voucherGenerated.accessKey}`);
                const validationResult: SriValidationResult = await this.sendToSriSignedVoucher(companyId, env, voucherGenerated.accessKey || '');
                voucherGenerated.status = VOUCHER_STATUS.RECEIVED;
                voucherGenerated.messages = validationResult.messages || [];
            }
            // === 4. Autorizar comprobante ===
            if (voucherGenerated.status == VOUCHER_STATUS.RECEIVED || voucherGenerated.status == VOUCHER_STATUS.PROCESSING) {
                this.logger.debug(`4. Authorizing voucher for accessKey: ${voucherGenerated.accessKey}`);
                const authorizationResult: SriAuthorizationResult = await this.sendToSriValidatedVoucher(companyId, env, voucherGenerated.accessKey || '');
                voucherGenerated.status = VOUCHER_STATUS.AUTHORIZED;
                voucherGenerated.xml = authorizationResult.voucher;
                voucherGenerated.messages = authorizationResult.messages || [];
            }
            this.logger.info("🎉 Proceso completado con éxito.");

            return {
                accessKey: voucherGenerated.accessKey,
                status: voucherGenerated.status,
                messages: voucherGenerated.messages || [],
                xml: voucherGenerated.xml
            } as AddVoucherResponse;

        } catch (error: any) {
            throw error;
        }
    }

    executeValidationVoucher = async (companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<SriValidationResult> => {

        try {
            const voucherId: IVoucherId = this.getVoucherKeyFromAccessKey(accessKey);
            let voucherGenerated: IVoucher = await this._voucherRepository.findById(companyId, voucherId) as IVoucher;

            if (!voucherGenerated) {
                throw new Error(`Voucher with accessKey ${accessKey} not found for companyId ${companyId}.`);
            }

            if (voucherGenerated.status == VOUCHER_STATUS.RECEIVED || voucherGenerated.status == VOUCHER_STATUS.PROCESSING) {


                const authorizationResult: SriAuthorizationResult = await this.sendToSriValidatedVoucher(companyId, env, voucherGenerated.accessKey || '');

                voucherGenerated.status = VOUCHER_STATUS.AUTHORIZED;
                voucherGenerated.xml = authorizationResult.voucher;
                voucherGenerated.messages = authorizationResult.messages || [];
            }

            return {
                accessKey: accessKey,
                status: voucherGenerated.status,
                messages: voucherGenerated.messages || [],
                xml: voucherGenerated.xml
            } as AddVoucherResponse;


        } catch (error: any) {
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

    generateSignedInvoice = async (companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<AddVoucherResponse> => {
        this.logger.debug(`Signing XML for invoice for companyId: ${companyId} environment: ${env}`);

        const sriVoucherResult: SriVoucherResult = await this._sriProccessService.generateInvoiceXML(companyId, env, invoiceData);

        const xml = sriVoucherResult.xml;

        this.logger.debug(`Generated XML: ${xml.substring(0, 100)}...`);

        const p12Buffer = await this._storageService.readCertificateP12(companyId);

        const company = await this._companyRepository.findById({ companyId });

        if (!company) {
            throw new Error(`Company with ID ${companyId} not found.`);
        }

        // TO-DO: Retrieve password securely
        const password = company.signaturePassword;

        const signedXml: string = await this._sriProccessService.signXML({
            p12Buffer: p12Buffer,
            password: password,
            xmlBuffer: Buffer.from(xml)
        });
        return { xml: signedXml, accessKey: sriVoucherResult.accessKey, status: VOUCHER_STATUS.SIGNED, messages: [] } as AddVoucherResponse;
    }

    private generateInvoiceXML = async (companyId: string, env: ENVIRONMENT_TYPE, invoiceData: AddInvoiceRequest): Promise<SriVoucherResult> => {
        this.logger.debug(`Generating XML for invoice for companyId: ${companyId} environment: ${env}`);
        try {
            const voucherResponse = await this._sriProccessService.generateInvoiceXML(companyId, env, invoiceData);

            if (!voucherResponse || !voucherResponse.xml || !voucherResponse.accessKey) {
                throw new SigningVoucherException("Error generating signed XML voucher.");
            }

            await this._storageService.writeGeneratedVoucher(
                companyId,
                voucherResponse.accessKey,
                Buffer.from(voucherResponse.xml)
            );

            const voucherId: IVoucherId = {
                voucherType: VOUCHER_TYPE.INVOICE,
                establishment: invoiceData.factura.estab,
                branch: invoiceData.factura.ptoEmi,
                sequence: invoiceData.factura.secuencial
            };

            await this._voucherRepository.update(
                companyId,
                voucherId,
                {
                    accessKey: voucherResponse.accessKey,
                    xml: voucherResponse.xml,
                    status: VOUCHER_STATUS.GENERATED
                } as IVoucher
            );

            return voucherResponse;

        } catch (error: any) {
            this.logger.error(`Error generating XML for invoice for companyId: ${companyId} environment: ${env}`, error);
            throw new AddVoucherException(`Error generating XML for invoice: ${error.message}`);

        }
    }

    private signVoucher = async (companyId: string, accessKey: string): Promise<string> => {
        this.logger.debug(`Signing XML voucher for companyId: ${companyId}`);

        try {
            const xmlBuffer: Buffer = await this._storageService.readGeneratedVoucher(
                companyId,
                accessKey
            );

            const p12Buffer = await this._storageService.readCertificateP12(companyId);

            const company = await this._companyRepository.findById({ companyId });

            if (!company) {
                throw new SigningVoucherException(`Company with ID ${companyId} not found.`);
            }

            // TO-DO: Retrieve password securely
            const password = company.signaturePassword;

            const signedXml: string = await this._sriProccessService.signXML({
                p12Buffer: p12Buffer,
                password: password,
                xmlBuffer: xmlBuffer
            });

            await this._storageService.writeSignedVoucher(
                companyId,
                accessKey,
                Buffer.from(signedXml)
            );

            const voucherId: IVoucherId = this.getVoucherKeyFromAccessKey(accessKey);

            await this._voucherRepository.update(
                companyId,
                voucherId,
                {
                    status: VOUCHER_STATUS.SIGNED,
                    xml: signedXml
                } as IVoucher
            );

            return signedXml;
        } catch (error: any) {
            this.logger.error(`Error signing voucher with accessKey ${accessKey}:`, error);
            throw new SigningVoucherException(`Error signing voucher with accessKey ${accessKey}: ${error.message}`);
        }
    }

    private sendToSriSignedVoucher = async (companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<SriValidationResult> => {
        this.logger.debug(`Validating signed XML for voucher with accessKey: ${accessKey}`);

        try {
            const voucherId: IVoucherId = this.getVoucherKeyFromAccessKey(accessKey);

            const signedXml: Buffer = await this._storageService.readSignedVoucher(
                companyId,
                accessKey
            );

            const validationSriResult: SriValidationResult = await this._sriProccessService.validateXML(
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

            return validationSriResult;

        } catch (error: any) {
            throw error;
        }
    }

    private sendToSriValidatedVoucher = async (companyId: string, env: ENVIRONMENT_TYPE, accessKey: string): Promise<SriAuthorizationResult> => {
        this.logger.info(`🚀 Iniciando proceso de autorización SRI para la empresa: ${companyId} en entorno ${env} con clave de acceso: ${accessKey}`);
        try {

            this.logger.debug(`Iniciando autorización del comprobante...`);


            const voucherId: IVoucherId = this.getVoucherKeyFromAccessKey(accessKey);

            // === 4. Autorizar comprobante ===
            const authorizationResult: SriAuthorizationResult = await this._sriProccessService.authorizeXML(
                env,
                accessKey
            );

            this.logger.debug(`authorization response: ${JSON.stringify(authorizationResult)}`);

            if (!authorizationResult || authorizationResult.status !== 'AUTORIZADO') {
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

                this.logger.error(`❌ Error de autorización:`, authorizationResult);

                throw new AuthorizationVoucherException(`Voucher authorization failed`, authorizationResult.messages);
            }


            await this._storageService.writeAuthorizedVoucher(
                companyId,
                accessKey || '',
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

            this.logger.info(`🧾 Comprobante autorizado correctamente:`);
            return authorizationResult;
        } catch (error) {
            this.logger.error("❌ Error durante el proceso:", error);
            throw error;
        }

    }

    private getVoucherKeyFromAccessKey = (accessKey: string): IVoucherId => {

        const voucherTypeCode = accessKey.substring(8, 10);
        const estab = accessKey.substring(24, 27);
        const ptoEmi = accessKey.substring(27, 30);
        const secuencial = accessKey.substring(30, 39);

        return {
            voucherType: voucherTypeCode,
            establishment: estab,
            branch: ptoEmi,
            sequence: secuencial
        } as IVoucherId;
    }


}

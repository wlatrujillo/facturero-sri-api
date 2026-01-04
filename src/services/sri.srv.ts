import fs from 'node:fs';


import { ENVIRONMENT, InvoiceGenerator } from 'facturero-sri-signer';
import { ReceptionService } from 'facturero-sri-signer';
import type { Invoice } from 'facturero-sri-signer';
import { XmlSigner } from 'facturero-sri-signer';

import { StorageService } from '@services/storage.srv.js';

const BUCKET_NAME = process.env.BUCKET_NAME || 'dev-facturero-storage';

class SriService {

    private invoiceGenerator: InvoiceGenerator;
    private receptionService: ReceptionService;
    private xmlSigner: XmlSigner;
    private storageService: StorageService;

    constructor() {

        this.invoiceGenerator = new InvoiceGenerator();
        this.receptionService = new ReceptionService();
        this.xmlSigner = new XmlSigner();
        this.storageService = new StorageService();
    }

    async generateInvoice(data: Invoice): Promise<string> {
        return await this.invoiceGenerator.generateXmlInvoice(data);
    }


    async generateInvoiceSigned(data: Invoice, companyIdentifier: string): Promise<string> {


        const xmlString = await this.invoiceGenerator.generateXmlInvoice(data);

        const p12Buffer = await this.storageService.getFileBuffer(BUCKET_NAME, 'certs', `${companyIdentifier}.p12`);

        const password = 'T818gar005';

        let signedXml = this.xmlSigner.signXml(p12Buffer, password, xmlString);

        this.storageService.uploadFile(BUCKET_NAME, 
            companyIdentifier, 
            `${data.infoTributaria.secuencial}-signed.xml`, 
            Buffer.from(signedXml));

        await this.receptionService.validateXml(ENVIRONMENT.PRUEBAS, signedXml);


        return xmlString;
    }

    async validateInvoice(secuencial: string | undefined): Promise<boolean> {
        // Lógica para validar una factura electrónica contra los requisitos del SRI

        let xml = fs.readFileSync(`./${secuencial}.xml`, 'utf-8');
        await this.receptionService.validateXml(ENVIRONMENT.PRUEBAS, xml);
        return true;
    }

    generateDebitNote(data: any): string {
        // Lógica para generar una nota de débito electrónica según los requisitos del SRI
        return "Nota de débito generada con éxito";
    }

    generateCreditNote(data: any): string {
        // Lógica para generar una nota de crédito electrónica según los requisitos del SRI
        return "Nota de crédito generada con éxito";
    }

    generateShippingGuide(data: any): string {
        // Lógica para generar una guía de remisión electrónica según los requisitos del SRI
        return "Guía de remisión generada con éxito";
    }

    generateWithholdingReceipt(data: any): string {
        // Lógica para generar un comprobante de retención electrónica según los requisitos del SRI
        return "Comprobante de retención generado con éxito";
    }


}

export default SriService;

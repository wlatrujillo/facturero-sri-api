import fs from 'node:fs';

import { ENVIRONMENT, InvoiceGenerator } from '@facturero-sri-signer/index.js';
import { ReceptionService } from '@facturero-sri-signer/index.js';
import type { Invoice } from '@facturero-sri-signer/models/invoice.js';

class SriService {

    private invoiceGenerator: InvoiceGenerator;
    private receptionService: ReceptionService;

    constructor() {

        this.invoiceGenerator = new InvoiceGenerator();
        this.receptionService = new ReceptionService();
    }


    async generateInvoice(data: Invoice): Promise<string> {
        // Lógica para generar una factura electrónica según los requisitos del SRI
        //


        let xmlString = await this.invoiceGenerator.generateXmlInvoice(data);

        // Aquí se podría agregar la lógica para firmar el XML y enviarlo al SRI

        fs.writeFileSync(`${data.infoTributaria.secuencial}.xml`, xmlString);

        let xml = fs.readFileSync(`./${data.infoTributaria.secuencial}.xml`, 'utf-8');
        await this.receptionService.validateXml(ENVIRONMENT.PRUEBAS, xml);


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


import { XmlParser } from './xmlparser.js';
import type { Invoice } from '../models/invoice.js';
import { InvoiceBuilder } from './invoice.builder.js';

export class InvoiceGenerator {

    private xmlParserService: XmlParser;

    constructor() {

        this.xmlParserService = new XmlParser();

    }

    async generateXmlInvoice(data: Invoice): Promise<string> {

        let jsonObject: any = new InvoiceBuilder()
            .withInfoTributaria(data.infoTributaria)
            .withInfoFactura(data.infoFactura)
            .withDetalles(data.detalles)
            .withInfoAdicional(data.infoAdicional)
            .build();

        return this.xmlParserService.parseJsonToXml(jsonObject);
    }

    async generateCreditNote(data: any): Promise<string> {
        // Lógica para generar una nota de crédito electrónica según los requisitos del SRI

        return "<CreditNote>Generated Credit Note XML</CreditNote>";
    }

    async generateDebitNote(data: any): Promise<string> {
        // Lógica para generar una nota de débito electrónica según los requisitos del SRI

        return "<DebitNote>Generated Debit Note XML</DebitNote>";
    }

    
}

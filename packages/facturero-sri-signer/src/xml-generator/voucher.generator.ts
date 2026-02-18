
import { XmlParser } from './xmlparser.js';
import type { Invoice } from '../models/invoice.js';
import { InvoiceBuilder } from '../builders/invoice.builder.js';
import { XmlInvoiceResponse } from '../dtos/xml.invoice.response.js';
import { InvoiceValidator } from '../validators/invoice.validator.js';
import { InvoiceGeneratorException } from '../exceptions/xml.generator.exceptions.js';

export class VoucherGenerator {

    private xmlParserService: XmlParser;

    constructor() {

        this.xmlParserService = new XmlParser();

    }

    generateXmlInvoice = async (data: Invoice): Promise<XmlInvoiceResponse> => {


        const errors = InvoiceValidator.validate(data);
        
        if (errors.length > 0) {
            throw new InvoiceGeneratorException(errors);
        }


        const jsonObject: any = new InvoiceBuilder()
            .withInfoTributaria(data.infoTributaria)
            .withInfoFactura(data.infoFactura)
            .withDetalles(data.detalles)
            .withInfoAdicional(data.infoAdicional)
            .build();

        const xml: string = this.xmlParserService.parseJsonToXml(jsonObject);

        return {
            xml: xml,
            accessKey: jsonObject.factura.infoTributaria.claveAcceso
        } as XmlInvoiceResponse;
    }



    async generateXmlCreditNote(_data: any): Promise<string> {
        // Lógica para generar una nota de crédito electrónica según los requisitos del SRI

        return "<CreditNote>Generated Credit Note XML</CreditNote>";
    }

    async generateXmlDebitNote(_data: any): Promise<string> {
        // Lógica para generar una nota de débito electrónica según los requisitos del SRI

        return "<DebitNote>Generated Debit Note XML</DebitNote>";
    }


}

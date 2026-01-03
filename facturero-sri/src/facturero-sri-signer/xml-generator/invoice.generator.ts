
import { XmlParser } from './xmlparser.js';
import type { InfoTributaria } from '../models/info-tributaria.js';
import type { InfoFactura } from '../models/info-factura.js';
import type { Impuesto } from '../models/impuesto.js';
import type { Pago } from '../models/pago.js';
import type { Detalle } from '../models/detalle.js';
import type { Invoice } from '../models/invoice.js';
import { AccessKeyGenerator } from './access-key.generator.js';

export class InvoiceGenerator {

    private xmlParserService: XmlParser;

    private accessKeyGenerator: AccessKeyGenerator;

    constructor() {

        this.xmlParserService = new XmlParser();
        this.accessKeyGenerator = new AccessKeyGenerator();

    }

    async generateXmlInvoice(data: Invoice): Promise<string> {
        // Lógica para generar una factura electrónica según los requisitos del SRI

        let jsonObject: any = {
            "?xml": {
                "@_version": "1.0",
                "@_encoding": "UTF-8"
            },
            factura: {
                "@_id": "comprobante",
                "@_version": "1.0.0",
                infoTributaria: this.generateInfoTributaria(data.infoTributaria, data.infoFactura.fechaEmision),
                infoFactura: this.generateInfoFactura(data.infoFactura),
                detalles: this.generateDetalles(data.detalles),
                infoAdicional: this.generateInfoAdicional(data.infoAdicional)
            }

        };



        return this.xmlParserService.parseJsonToXml(jsonObject);
    }

    private generateInfoTributaria(data: InfoTributaria, issueDate: Date): any {
        // Lógica para generar la sección de InfoTributaria
        
        let accessKey = data.claveAcceso || this.accessKeyGenerator.generateAccessKey(data, issueDate || new Date());

        let infoTributaria: any =
        {
            ambiente: data.ambiente,
            tipoEmision: data.tipoEmision,
            razonSocial: data.razonSocial,
            nombreComercial: data.nombreComercial,
            ruc: data.ruc,
            claveAcceso: accessKey,
            codDoc: data.codDoc,
            estab: data.estab,
            ptoEmi: data.ptoEmi,
            secuencial: data.secuencial,
            dirMatriz: data.dirMatriz
        }

        return infoTributaria;
    }

    private generateInfoFactura(data: InfoFactura): any {
        // Lógica para generar la sección de InfoFactura

        let totalConImpuestos: any[] = data
            .totalConImpuestos
            .map((impuesto: Impuesto) => ({
                totalImpuesto: {
                    codigo: impuesto.codigo,
                    codigoPorcentaje: impuesto.codigoPorcentaje,
                    baseImponible: impuesto.baseImponible,
                    valor: impuesto.valor
                }
            }));

        let pagos: any[] = data.pagos
            .map((pago: Pago) => ({
                pago: {
                    formaPago: pago.formaPago,
                    total: pago.total,
                    plazo: pago.plazo,
                    unidadTiempo: pago.unidadTiempo
                }
            }));


        let infoFactura: InfoFactura = {
            fechaEmision: data.fechaEmision,
            dirEstablecimiento: data.dirEstablecimiento,
            contribuyenteEspecial: data.contribuyenteEspecial,
            obligadoContabilidad: data.obligadoContabilidad,
            tipoIdentificacionComprador: data.tipoIdentificacionComprador,
            guiaRemision: data.guiaRemision,
            razonSocialComprador: data.razonSocialComprador,
            identificacionComprador: data.identificacionComprador,
            totalSinImpuestos: data.totalSinImpuestos,
            totalDescuento: data.totalDescuento,
            totalConImpuestos: totalConImpuestos,
            propina: data.propina,
            importeTotal: data.importeTotal,
            moneda: data.moneda,
            pagos: pagos,
            valorRetIva: data.valorRetIva,
            valorRetRenta: data.valorRetRenta
        };

        return infoFactura;
    }

    private generateDetalles(detalles: Detalle[]): any[] {
        // Lógica para generar la sección de Detalles

        let detallesXml: any[] = detalles
            .map((detalle: Detalle) => ({
                detalle: {
                    codigoPrincipal: detalle.codigoPrincipal,
                    descripcion: detalle.descripcion,
                    cantidad: detalle.cantidad,
                    precioUnitario: detalle.precioUnitario,
                    descuento: detalle.descuento,
                    precioTotalSinImpuesto: detalle.precioTotalSinImpuesto,
                    detallesAdicionales: detalle.detallesAdicionales
                        .map((adicional: { nombre: string; valor: string }) => ({
                            detAdicional: {
                                "@_nombre": adicional.nombre,
                                "@_valor": adicional.valor,
                                "#text": ""
                            }
                        }))
                    ,
                    impuestos: detalle.impuestos.map((impuesto: Impuesto) => ({
                        impuesto: {
                            codigo: impuesto.codigo,
                            codigoPorcentaje: impuesto.codigoPorcentaje,
                            tarifa: impuesto.tarifa,
                            baseImponible: impuesto.baseImponible,
                            valor: impuesto.valor
                        }
                    }))
                }
            }));
        return detallesXml;
    }

    private generateInfoAdicional(infoAdicional: { nombre: string; valor: string }[]): any[] {
        // Lógica para generar la sección de InfoAdicional


        if (infoAdicional === undefined) {
            infoAdicional = [];
        }

        let infoAdicionalXml: any[] = infoAdicional
            .map((info: { nombre: string; valor: string }) => ({
                campoAdicional: {
                    "@_nombre": info.nombre,
                    "#text": info.valor
                }
            }));
        return infoAdicionalXml;
    }

}

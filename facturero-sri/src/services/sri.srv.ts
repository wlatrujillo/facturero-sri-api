
import XmlParserService from './xmlparser.srv.js';

class SriService {

    private xmlParserService: XmlParserService;

    constructor() {

        this.xmlParserService = new XmlParserService();

    }


    generateInvoice(data: any): string {
        // Lógica para generar una factura electrónica según los requisitos del SRI
        //

        let jsonObject: any = {
            "?xml": {
                "@_version": "1.0",
                "@_encoding": "UTF-8"
            },
            factura: {
                "@_id": "comprobante",
                "@_version": "1.0.0",
                infoTributaria: {
                    ambiente: data.infoTributaria.ambiente,
                    tipoEmision: data.infoTributaria.tipoEmision,
                    razonSocial: data.infoTributaria.razonSocial,
                    nombreComercial: data.infoTributaria.nombreComercial,
                    ruc: data.infoTributaria.ruc,
                    claveAcceso: data.infoTributaria.claveAcceso,
                    codDoc: data.infoTributaria.codDoc,
                    estab: data.infoTributaria.estab,
                    ptoEmi: data.infoTributaria.ptoEmi,
                    secuencial: data.infoTributaria.secuencial,
                    dirMatriz: data.infoTributaria.dirMatriz
                },
                infoFactura: {
                    fechaEmision: data.infoFactura.fechaEmision,
                    dirEstablecimiento: data.infoFactura.dirEstablecimiento,
                    contribuyenteEspecial: data.infoFactura.contribuyenteEspecial,
                    obligadoContabilidad: data.infoFactura.obligadoContabilidad,
                    tipoIdentificacionComprador: data.infoFactura.tipoIdentificacionComprador,
                    guiaRemision: data.infoFactura.guiaRemision,
                    razonSocialComprador: data.infoFactura.razonSocialComprador,
                    identificacionComprador: data.infoFactura.identificacionComprador,
                    totalSinImpuestos: data.infoFactura.totalSinImpuestos,
                    totalDescuento: data.infoFactura.totalDescuento,
                    totalConImpuestos: [] as any[],
                    propina: data.infoFactura.propina,
                    importeTotal: data.infoFactura.importeTotal,
                    moneda: data.infoFactura.moneda,
                    pagos: [] as any[],
                    valorRetIva: data.infoFactura.valorRetIva,
                    valorRetRenta: data.infoFactura.valorRetRenta
                },
                detalles: [] as any[],
                infoAdicional: [] as any[]
            }

        };

        // Agregar detalles de impuestos
        data.infoFactura.totalConImpuestos.forEach((impuesto: any) => {
            jsonObject.factura.infoFactura.totalConImpuestos.push({
                totalImpuesto: {
                    codigo: impuesto.codigo,
                    codigoPorcentaje: impuesto.codigoPorcentaje,
                    baseImponible: impuesto.baseImponible,
                    valor: impuesto.valor
                }
            });
        });

        // Agregar detalles de pagos
        data.infoFactura.pagos.forEach((pago: any) => {
            jsonObject.factura.infoFactura.pagos.push({
                pago: {
                    formaPago: pago.formaPago,
                    total: pago.total,
                    plazo: pago.plazo,
                    unidadTiempo: pago.unidadTiempo
                }
            });
        });

        // Agregar detalles de la factura
        data.detalles.forEach((detalle: any) => {
            jsonObject.factura.detalles.push({
                detalle: {
                    codigoPrincipal: detalle.codigoPrincipal,
                    descripcion: detalle.descripcion,
                    cantidad: detalle.cantidad,
                    precioUnitario: detalle.precioUnitario,
                    descuento: detalle.descuento,
                    precioTotalSinImpuesto: detalle.precioTotalSinImpuesto,
                    detallesAdicionales: detalle.detallesAdicionales
                        .map((adicional: any) => ({
                            detAdicional: {
                                "@_nombre": adicional.nombre,
                                "@_valor": adicional.valor,
                                "#text": ""
                            }
                        }))
                    ,
                    impuestos: detalle.impuestos.map((impuesto: any) => ({
                        impuesto: {
                            codigo: impuesto.codigo,
                            codigoPorcentaje: impuesto.codigoPorcentaje,
                            tarifa: impuesto.tarifa,
                            baseImponible: impuesto.baseImponible,
                            valor: impuesto.valor
                        }
                    }))
                }
            });
        });

        // Agregar información adicional
        data.infoAdicional.forEach((info: any) => {
            jsonObject.factura.infoAdicional.push({
                campoAdicional: {
                    "@_nombre": info.nombre,
                    "#text": info.valor
                }
            });
        });

        let xmlString = this.xmlParserService.parseJsonToXml(jsonObject);

        // Aquí se podría agregar la lógica para firmar el XML y enviarlo al SRI

        return xmlString;
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

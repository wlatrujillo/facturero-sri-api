
import type { InfoTributaria } from "@facturero-sri-signer/models/info-tributaria.js";
import { AccessKeyGenerator } from "./access-key.generator.js";
import type { InfoFactura } from "@facturero-sri-signer/models/info-factura.js";
import type { Impuesto } from "@facturero-sri-signer/models/impuesto.js";
import type { Pago } from "@facturero-sri-signer/models/pago.js";
import { DateFormat } from "@facturero-sri-signer/utils/date.format.js";
import type { Detalle } from "@facturero-sri-signer/models/detalle.js";
import { ENVIRONMENT } from "@facturero-sri-signer/enums/enviroment.enum.js";

export class InvoiceBuilder {




    private infoTributaria!: any;
    private infoFactura!: any;
    private detalles!: any[];
    private infoAdicional!: any;




    withInfoTributaria(data: InfoTributaria): InvoiceBuilder {

        this.infoTributaria = {
            ambiente: data.ambiente || ENVIRONMENT.PRUEBAS,
            tipoEmision: data.tipoEmision || 1,
            razonSocial: data.razonSocial,
            nombreComercial: data.nombreComercial,
            ruc: data.ruc,
            codDoc: data.codDoc,
            estab: data.estab,
            ptoEmi: data.ptoEmi,
            secuencial: data.secuencial,
            dirMatriz: data.dirMatriz,
            claveAcceso: data.claveAcceso
        }
        return this;
    }

    withInfoFactura(data: InfoFactura): any {
        // Lógica para generar la sección de InfoFactura

        let issueDate = data.fechaEmision || new Date();

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


        this.infoFactura = {
            fechaEmision: DateFormat.formatDate(issueDate),
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

        return this;
    }


    withDetalles(detalles: Detalle[]): InvoiceBuilder {
        // Lógica para generar la sección de Detalles

        this.detalles = detalles
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
        return this;
    }


    withInfoAdicional(infoAdicional: { nombre: string; valor: string }[]): InvoiceBuilder {
        // Lógica para generar la sección de InfoAdicional


        if (infoAdicional === undefined) {
            infoAdicional = [];
        }

        this.infoAdicional = infoAdicional
            .map((info: { nombre: string; valor: string }) => ({
                campoAdicional: {
                    "@_nombre": info.nombre,
                    "#text": info.valor
                }
            }));
        return this;
    }



    build(): any {



        if (!this.infoTributaria.claveAcceso) {
            let accessKey = AccessKeyGenerator.generateAccessKey(this.infoFactura.fechaEmision,
                this.infoTributaria.codDoc,
                this.infoTributaria.ruc,
                this.infoTributaria.ambiente,
                this.infoTributaria.estab,
                this.infoTributaria.ptoEmi,
                this.infoTributaria.secuencial,
                this.infoTributaria.tipoEmision);
            this.infoFactura.claveAcceso = accessKey;

        }

        return {
            "?xml": {
                "@_version": "1.0",
                "@_encoding": "UTF-8"
            },
            factura: {
                "@_id": "comprobante",
                "@_version": "1.0.0",
                infoTributaria: this.infoTributaria,
                infoFactura: this.infoFactura,
                detalles: this.detalles,
                infoAdicional: this.infoAdicional
            }

        }
    }

}
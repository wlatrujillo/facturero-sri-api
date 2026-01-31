import {
    ComprobanteType,
    DetallesModel,
    ImpuestoDetalleModel,
    InfoAdicionalModel,
    InfoFacturaModel,
    InfoTributariaModel
} from "osodreamer-sri-xml-signer";

import { AddInvoiceRequest } from "../dtos/add.invoice.request.js";



export class InvoiceMapperOsodreamer {

    static toInvoiceSriModel(invoiceData: AddInvoiceRequest): ComprobanteType {
        const invoiceModel = {} as ComprobanteType;

        invoiceModel.infoTributaria = this.toInfoTributaria(invoiceData.factura);
        invoiceModel.infoFactura = this.toInfoFactura(invoiceData.factura);
        invoiceModel.detalles = this.toDetalles(invoiceData.detalles);
        invoiceModel.infoAdicional = this.toInfoAdicional(invoiceData.infoAdicional || []);

        return invoiceModel;
    }

    static toInfoTributaria(data: any): InfoTributariaModel {
        return {
            ambiente: data.ambiente,
            razonSocial: data.razonSocial,
            nombreComercial: data.nombreComercial,
            ruc: data.ruc,
            estab: data.estab,
            ptoEmi: data.ptoEmi,
            secuencial: data.secuencial,
            dirMatriz: data.dirMatriz,
            // obligadoContabilidad: "SI",
            // agenteRetencion: "1",
            // contribuyenteRimpe: "CONTRIBUYENTE RÉGIMEN RIMPE"
        };
    }

    static toInfoFactura(data: any): InfoFacturaModel {
        data.totalConImpuestos ??= [];
        data.pagos ??= [];

        let issueDate: Date = new Date();

        if (data.fechaEmision && data.fechaEmision instanceof Date) {
            issueDate = data.fechaEmision;
        } else if (data.fechaEmision && typeof data.fechaEmision === "string" && data.fechaEmision.trim() !== "") {
            issueDate = new Date(data.fechaEmision);
        }

        return {
            fechaEmision: issueDate,
            dirEstablecimiento: data.dirEstablecimiento,
            // contribuyenteEspecial: "sd3",
            tipoIdentificacionComprador: data.tipoIdentificacionComprador,
            razonSocialComprador: data.razonSocialComprador,
            identificacionComprador: data.identificacionComprador,
            direccionComprador: data.direccionComprador,
            totalSinImpuestos: data.totalSinImpuestos,
            totalDescuento: data.totalDescuento,
            totalConImpuestos: { totalImpuesto: data.totalConImpuestos },
            propina: 0.0,
            importeTotal: data.importeTotal,
            moneda: data.moneda,
            pagos: { pago: data.pagos },
            valorRetIva: data.valorRetIva || 0,
            valorRetRenta: data.valorRetRenta || 0,
        };
    }

    static toDetalles(detalles: any): DetallesModel {

        return {
            detalle: detalles.map((detalle: any) => ({
                codigoPrincipal: detalle.codigoPrincipal,
                descripcion: detalle.descripcion,
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precioUnitario,
                descuento: detalle.descuento,
                precioTotalSinImpuesto: detalle.precioTotalSinImpuesto,
                impuestos: { impuesto: detalle.impuestos as ImpuestoDetalleModel[] || [] },
                detallesAdicionales: { detAdicional: detalle.detallesAdicionales || [] }
            }))
        };

    }

    static toInfoAdicional(infoAdicional: any): InfoAdicionalModel {
        return {
            campoAdicional: infoAdicional.map((info: any) => ({
                nombre: info.nombre,
                value: info.valor
            }))
        }
    }
}
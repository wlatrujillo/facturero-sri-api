import { IDENTIFICATION_ENUM } from "facturero-sri-signer";
import type { Invoice, Impuesto } from "facturero-sri-signer";

import type { AddInvoiceRequest } from "../dtos/add.invoice.request.js";


export class InvoiceMapper {

    static toInvoiceSriModel(invoiceData: AddInvoiceRequest): Invoice {
        const invoiceModel = {} as Invoice;
        invoiceModel.infoTributaria = this.toInfoTributaria(invoiceData.factura);
        invoiceModel.infoFactura = this.toInfoFactura(invoiceData.factura);
        invoiceModel.detalles = this.toDetalles(invoiceData.detalles);
        invoiceModel.infoAdicional = this.toInfoAdicional(invoiceData.infoAdicional);
        return invoiceModel;
    }


    static toInfoTributaria(data: any): any {
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

    static toInfoFactura(data: any): any {
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
            obligadoContabilidad: data.obligadoContabilidad || "NO",
            tipoIdentificacionComprador: data.tipoIdentificacionComprador as IDENTIFICATION_ENUM,
            razonSocialComprador: data.razonSocialComprador,
            identificacionComprador: data.identificacionComprador,
            direccionComprador: data.direccionComprador,
            totalSinImpuestos: data.totalSinImpuestos,
            totalDescuento: data.totalDescuento,
            totalConImpuestos: data.totalConImpuestos,
            propina: data.propina || 0.0,
            importeTotal: data.importeTotal,
            moneda: data.moneda,
            pagos: data.pagos,
            valorRetIva: data.valorRetIva || 0,
            valorRetRenta: data.valorRetRenta || 0,
        };
    }

    static toDetalles(detalles: any[]): any {

        return detalles.map((detalle: any) => ({
            codigoPrincipal: detalle.codigoPrincipal,
            descripcion: detalle.descripcion,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            descuento: detalle.descuento,
            precioTotalSinImpuesto: detalle.precioTotalSinImpuesto,
            impuestos: detalle.impuestos as Impuesto[] || [],
            detallesAdicionales: detalle.detallesAdicionales || []
        }));

    }

    static toInfoAdicional(infoAdicional: any): any {
        return infoAdicional
    }


}
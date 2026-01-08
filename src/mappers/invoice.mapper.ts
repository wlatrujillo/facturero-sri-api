import { ComprobanteModel, IDENTIFICATION_CODE_ENUM, OBLIGADO_CONTABILIDAD_ENUM, type Pago, type TotalImpuesto } from "osodreamer-sri-xml-signer";

export class InvoiceMapper {

    static toInvoiceSriModel(invoiceData: any): ComprobanteModel {
        const invoiceModel = new ComprobanteModel();
        invoiceModel.infoTributaria = this.toInfoTributaria(invoiceData.infoTributaria);
        invoiceModel.infoFactura = this.toInfoFactura(invoiceData.infoFactura);
        invoiceModel.detalles = { detalle: this.toDetalles(invoiceData.detalles) };
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
            // agenteRetencion: "1",
            // contribuyenteRimpe: "CONTRIBUYENTE RÉGIMEN RIMPE"
        };
    }

    static toInfoFactura(data: any): any {
        data.totalConImpuestos ??= [];
        data.pagos ??= [];

        let issueDate: Date;

        if (data.fechaEmision && data.fechaEmision instanceof Date) {
            issueDate = data.fechaEmision;
        } else if (data.fechaEmision && data.fechaEmision instanceof String && data.fechaEmision.trim() !== "") {
            issueDate = data.fechaEmision instanceof Date
                ? data.fechaEmision
                : new Date(data.fechaEmision);
        } else {
            issueDate = new Date();
        }

        return {
            fechaEmision: issueDate,
            dirEstablecimiento: data.dirEstablecimiento,
            // contribuyenteEspecial: "sd3",
            obligadoContabilidad: OBLIGADO_CONTABILIDAD_ENUM.NO,
            tipoIdentificacionComprador: IDENTIFICATION_CODE_ENUM.CEDULA,
            razonSocialComprador: data.razonSocialComprador,
            identificacionComprador: data.identificacionComprador,
            direccionComprador: data.direccionComprador,
            totalSinImpuestos: data.totalSinImpuestos,
            totalDescuento: data.totalDescuento,
            totalConImpuestos: {
                totalImpuesto: data.totalConImpuestos
            },
            propina: 0.0,
            importeTotal: data.importeTotal,
            moneda: data.moneda,
            pagos: {
                pago: data.pagos
            },
            valorRetIva: data.valorRetIva || 0,
            valorRetRenta: data.valorRetRenta || 0,
        };
    }

    static toDetalles(detalles: any): any {


        return detalles.map((detalle: any) => ({
            codigoPrincipal: detalle.codigoPrincipal,
            descripcion: detalle.descripcion,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            descuento: detalle.descuento,
            precioTotalSinImpuesto: detalle.precioTotalSinImpuesto,
            impuestos: {
                impuesto: detalle.impuestos as TotalImpuesto[] || []
            },
            detallesAdicionales: {
                detAdicional: detalle.detallesAdicionales || []
            }
        }));



    }

    static toInfoAdicional(data: any): any {
        return {
            campoAdicional: data.infoAdicional
        }
    }


}
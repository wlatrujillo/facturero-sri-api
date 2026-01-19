export interface InvoiceDTO {
    
   factura: {
        razonSocial: string;
        nombreComercial: string;
        dirMatriz: string;
        estab: string;
        ptoEmi: string;
        secuencial: string;
        fechaEmision: string;
        dirEstablecimiento: string;
        contribuyenteEspecial: string;
        obligadoContabilidad: string;
        tipoIdentificacionComprador: string,
        guiaRemision: string;
        razonSocialComprador: string;
        identificacionComprador: string;
        direccionComprador: string;
        totalSinImpuestos: number;
        totalDescuento: number;
        totalConImpuestos: [
               
                {
                    codigo: number;
                    codigoPorcentaje: number;
                    baseImponible: number;
                    valor: number;
                }
            
        ],
        propina: number;
        importeTotal: number;
        moneda: string;
        pagos: [
            {
                formaPago: string;
                total: number;
                plazo: number;
                unidadTiempo: string;
            }
        ],
        valorRetIva: number;
        valorRetRenta: number;
    };
    detalles: Array<{
        codigoPrincipal: string;
        codigoAuxiliar?: string;
        descripcion: string;
        cantidad: number;
        precioUnitario: number;
        descuento: number;
        precioTotalSinImpuesto: number;
        impuestos?: Array<{
            codigo: string;
            codigoPorcentaje: string;
            tarifa: number;
            baseImponible: number;
            valor: number;
        }>;
    }>;
    infoAdicional?: Array<{
        nombre: string;
        valor: string;
    }>;
}
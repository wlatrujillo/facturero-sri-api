/**
 * @swagger
 * components:
 *   schemas:
 *     AddInvoiceRequest:
 *       type: object
 *       required:
 *         - factura
 *         - detalles
 *       properties:
 *         factura:
 *           type: object
 *           description: Información general de la factura
 *           required:
 *             - razonSocial
 *             - nombreComercial
 *             - dirMatriz
 *             - estab
 *             - ptoEmi
 *             - secuencial
 *             - fechaEmision
 *             - dirEstablecimiento
 *             - contribuyenteEspecial
 *             - obligadoContabilidad
 *             - tipoIdentificacionComprador
 *             - guiaRemision
 *             - razonSocialComprador
 *             - identificacionComprador
 *             - direccionComprador
 *             - totalSinImpuestos
 *             - totalDescuento
 *             - totalConImpuestos
 *             - propina
 *             - importeTotal
 *             - moneda
 *             - pagos
 *             - valorRetIva
 *             - valorRetRenta
 *           properties:
 *             razonSocial:
 *               type: string
 *               description: Razón social del emisor
 *               example: "EMPRESA EJEMPLO S.A."
 *             nombreComercial:
 *               type: string
 *               description: Nombre comercial del emisor
 *               example: "Ejemplo Corp"
 *             dirMatriz:
 *               type: string
 *               description: Dirección de la matriz
 *               example: "Av. Principal 123 y Secundaria"
 *             estab:
 *               type: string
 *               description: Código del establecimiento (3 dígitos)
 *               example: "001"
 *             ptoEmi:
 *               type: string
 *               description: Código del punto de emisión (3 dígitos)
 *               example: "001"
 *             secuencial:
 *               type: string
 *               description: Número secuencial de la factura (9 dígitos)
 *               example: "000000001"
 *             fechaEmision:
 *               type: string
 *               description: Fecha de emisión de la factura (formato dd/MM/yyyy)
 *               example: "23/01/2026"
 *             dirEstablecimiento:
 *               type: string
 *               description: Dirección del establecimiento emisor
 *               example: "Av. Principal 123"
 *             contribuyenteEspecial:
 *               type: string
 *               description: Número de resolución de contribuyente especial
 *               example: "12345"
 *             obligadoContabilidad:
 *               type: string
 *               description: Obligado a llevar contabilidad (SI/NO)
 *               example: "SI"
 *             tipoIdentificacionComprador:
 *               type: string
 *               description: Tipo de identificación del comprador
 *               example: "04"
 *             guiaRemision:
 *               type: string
 *               description: Número de guía de remisión
 *               example: "001-001-000000001"
 *             razonSocialComprador:
 *               type: string
 *               description: Razón social del comprador
 *               example: "CLIENTE EJEMPLO S.A."
 *             identificacionComprador:
 *               type: string
 *               description: RUC/Cédula del comprador
 *               example: "1234567890001"
 *             direccionComprador:
 *               type: string
 *               description: Dirección del comprador
 *               example: "Calle Secundaria 456"
 *             totalSinImpuestos:
 *               type: number
 *               description: Total sin impuestos
 *               example: 100.00
 *             totalDescuento:
 *               type: number
 *               description: Total de descuentos aplicados
 *               example: 10.00
 *             totalConImpuestos:
 *               type: array
 *               description: Listado de impuestos aplicados
 *               items:
 *                 type: object
 *                 properties:
 *                   codigo:
 *                     type: number
 *                     description: Código del tipo de impuesto (2=IVA)
 *                     example: 2
 *                   codigoPorcentaje:
 *                     type: number
 *                     description: Código del porcentaje de impuesto
 *                     example: 2
 *                   baseImponible:
 *                     type: number
 *                     description: Base imponible del impuesto
 *                     example: 100.00
 *                   valor:
 *                     type: number
 *                     description: Valor del impuesto
 *                     example: 12.00
 *             propina:
 *               type: number
 *               description: Valor de la propina
 *               example: 0.00
 *             importeTotal:
 *               type: number
 *               description: Importe total de la factura
 *               example: 112.00
 *             moneda:
 *               type: string
 *               description: Código de moneda
 *               example: "DOLAR"
 *             pagos:
 *               type: array
 *               description: Formas de pago
 *               items:
 *                 type: object
 *                 properties:
 *                   formaPago:
 *                     type: string
 *                     description: Código de forma de pago (01=SIN UTILIZACION DEL SISTEMA FINANCIERO)
 *                     example: "01"
 *                   total:
 *                     type: number
 *                     description: Total del pago
 *                     example: 112.00
 *                   plazo:
 *                     type: number
 *                     description: Plazo de pago
 *                     example: 0
 *                   unidadTiempo:
 *                     type: string
 *                     description: Unidad de tiempo del plazo
 *                     example: "dias"
 *             valorRetIva:
 *               type: number
 *               description: Valor de retención de IVA
 *               example: 0.00
 *             valorRetRenta:
 *               type: number
 *               description: Valor de retención de renta
 *               example: 0.00
 *         detalles:
 *           type: array
 *           description: Detalles de los productos/servicios facturados
 *           items:
 *             type: object
 *             required:
 *               - codigoPrincipal
 *               - descripcion
 *               - cantidad
 *               - precioUnitario
 *               - descuento
 *               - precioTotalSinImpuesto
 *             properties:
 *               codigoPrincipal:
 *                 type: string
 *                 description: Código principal del producto/servicio
 *                 example: "PROD001"
 *               codigoAuxiliar:
 *                 type: string
 *                 description: Código auxiliar del producto/servicio
 *                 example: "AUX001"
 *               descripcion:
 *                 type: string
 *                 description: Descripción del producto/servicio
 *                 example: "Producto de ejemplo"
 *               cantidad:
 *                 type: number
 *                 description: Cantidad del producto/servicio
 *                 example: 10
 *               precioUnitario:
 *                 type: number
 *                 description: Precio unitario del producto/servicio
 *                 example: 10.00
 *               descuento:
 *                 type: number
 *                 description: Descuento aplicado
 *                 example: 0.00
 *               precioTotalSinImpuesto:
 *                 type: number
 *                 description: Precio total sin impuestos
 *                 example: 100.00
 *               impuestos:
 *                 type: array
 *                 description: Impuestos aplicados al detalle
 *                 items:
 *                   type: object
 *                   properties:
 *                     codigo:
 *                       type: string
 *                       description: Código del tipo de impuesto
 *                       example: "2"
 *                     codigoPorcentaje:
 *                       type: string
 *                       description: Código del porcentaje de impuesto
 *                       example: "2"
 *                     tarifa:
 *                       type: number
 *                       description: Tarifa del impuesto
 *                       example: 12
 *                     baseImponible:
 *                       type: number
 *                       description: Base imponible del impuesto
 *                       example: 100.00
 *                     valor:
 *                       type: number
 *                       description: Valor del impuesto
 *                       example: 12.00
 *         infoAdicional:
 *           type: array
 *           description: Información adicional de la factura
 *           items:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del campo adicional
 *                 example: "Email"
 *               valor:
 *                 type: string
 *                 description: Valor del campo adicional
 *                 example: "cliente@ejemplo.com"
 */
export interface AddInvoiceRequest {
    
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
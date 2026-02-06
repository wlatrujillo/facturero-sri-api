/**
 * @swagger
 * components:
 *   schemas:
 *     AddVoucherResponse:
 *       type: object
 *       properties:
 *         accessKey:
 *           type: string
 *           description: Clave de acceso del comprobante electrónico (49 dígitos)
 *         status:
 *           type: string
 *           description: Estado del comprobante (e.g., 'PENDING', 'VALIDATED', 'AUTHORIZED')
 *         xml:
 *           type: string
 *           description: XML autorizado del comprobante electrónico en formato string
 *         messages:
 *           type: array
 */
export interface AddVoucherResponse {
    accessKey: string;
    status: string;
    xml: string;
    messages: Array<string>;
}
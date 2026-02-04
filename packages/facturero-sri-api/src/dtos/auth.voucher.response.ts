/**
 * @swagger
 * components:
 *   schemas:
 *     AuthVoucherResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Estado del comprobante (e.g., 'PENDING', 'AUTHORIZED')
 *         messages:
 *           type: array
 */
export interface AuthVoucherResponse {
    status: string;
    messages: Array<string>;
}
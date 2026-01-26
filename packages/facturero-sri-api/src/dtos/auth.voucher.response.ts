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
 *         errors:
 *           type: array
 */
export interface AuthVoucherResponse {
    status: string;
    errors: Array<string>;
}
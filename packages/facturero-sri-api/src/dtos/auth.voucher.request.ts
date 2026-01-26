/**
 * @swagger
 * components:
 *   schemas:
 *     AuthVoucherRequest:
 *       type: object
 *       required:
 *         - accessKey
 *       properties:
 *         accessKey:
 *           type: string
 *           description: Clave de acceso del comprobante electrónico (49 dígitos)
 *           example: "2301202601099999999900120010010000000011234567818"
 */
export interface AuthVoucherRequest {
    accessKey: string;
}
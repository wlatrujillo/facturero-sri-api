import { VOUCHER_STATUS } from "../enums/voucher.status";

/**
 * @swagger
 * components:
 *   schemas:
 *     GetVoucherResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Estado del comprobante (e.g., 'PENDING', 'AUTHORIZED')
 *         accessKey:
 *           type: string
 *           description: Clave de acceso del comprobante
 */
export interface GetVoucherResponse {
    accessKey: string;
    status: VOUCHER_STATUS;
}
import { Router } from 'express';

import { SriController } from '../controllers/index.js';
import type { VoucherServiceSri } from '../services/voucher.srv.sri.js';

export class SriRoutes {

    router: Router;
    ctrl: SriController;

    constructor(private readonly voucherServiceSri: VoucherServiceSri) {
        this.router = Router();
        this.ctrl = new SriController(this.voucherServiceSri);
        this.routes();
    }

    routes() {

        /**
         * @swagger
         * /api/sri/invoice:
         *   post:
         *     summary: Genera una factura electrónica para el SRI
         *     description: Crea y procesa una factura electrónica según los estándares del SRI ecuatoriano
         *     tags:
         *       - Invoice
         *     parameters:
         *       - in: header
         *         name: X-API-Key
         *         required: true
         *         schema:
         *           type: string
         *         description: Clave de API para autenticación
         *       - in: header
         *         name: Content-Type
         *         required: true
         *         schema:
         *           type: string
         *         description: Tipo de contenido de la solicitud
         *         example: application/json
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/AddInvoiceRequest'
         *     responses:
         *       200:
         *         description: Factura generada exitosamente
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/AddVoucherResponse'
         *       400:
         *         description: Datos de factura inválidos
         *       401:
         *         description: API Key no válida o ausente
         *       500:
         *         description: Error interno del servidor
         */
        this.router.route('/invoice')
            .post(this.ctrl.generateInvoice);

        /**
         * @swagger
         * /api/sri/voucher/{type}/{establishment}/{branch}/{number}/status:
         *   get:
         *     summary: Obtiene el estado de un comprobante electrónico por su ID en el ambiente de test del SRI
         *     description: Recupera el estado, clave de acceso y XML de un comprobante electrónico utilizando su ID único
         *     tags:
         *       - Voucher Status
         *     parameters:
         *       - in: header
         *         name: X-API-Key
         *         required: true
         *         schema:
         *           type: string
         *         description: Clave de API para autenticación
         *       - in: path
         *         name: type
         *         required: true
         *         schema:
         *           type: string
         *           description: Tipo de comprobante (e.g., '01' para factura)
         *       - in: path
         *         name: establishment
         *         required: true
         *         schema:
         *           type: string
         *           description: Código del establecimiento (3 dígitos)
         *       - in: path
         *         name: branch
         *         required: true
         *         schema:
         *           type: string
         *           description: Código del punto de emisión (3 dígitos)
         *       - in: path
         *         name: number
         *         required: true
         *         schema:
         *           type: string
         *           description: Número de secuencial del comprobante (9 dígitos)
         *     responses:
         *       200:
         *         description: Estado del comprobante recuperado exitosamente
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/GetVoucherResponse'
         *       400:
         *         description: ID de comprobante inválido
         *       401:
         *         description: API Key no válida o ausente
         *       404:
         *         description: Comprobante no encontrado
         *       500:
         *         description: Error interno del servidor
         */
        this.router.route('/voucher/:type/:establishment/:branch/:number/status')
            .get(this.ctrl.getVoucherStatusByVoucherId);



    }
}

export default SriRoutes;

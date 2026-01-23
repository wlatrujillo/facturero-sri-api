

import { SriController } from '@controllers/index.js';
import type { VoucherServiceSri } from '@services/voucher.srv.sri.js';
import { Router } from 'express';

export class SriTestRoutes {

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
         * /api/sri-test/test/invoice:
         *   post:
         *     summary: Genera una factura electrónica en el ambiente de test del SRI
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
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   example: "Factura generada exitosamente"
         *       400:
         *         description: Datos de factura inválidos
         *       401:
         *         description: API Key no válida o ausente
         *       500:
         *         description: Error interno del servidor
         */
        this.router.route('/test/invoice')
            .post(this.ctrl.generateInvoice);

        /**
         * @swagger
         * /api/sri-test/test/invoice/authorize:
         *   put:
         *     summary: Autoriza una factura electrónica en el ambiente de test del SRI
         *     description: Envía una solicitud de autorización para una factura electrónica previamente generada
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
         *             $ref: '#/components/schemas/AuthVoucherRequest'
         *     responses:
         *       200:
         *         description: Factura autorizada exitosamente
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   example: "Factura autorizada exitosamente"
         *       400:
         *         description: Datos de autorización inválidos
         *       401:
         *         description: API Key no válida o ausente
         *       500:
         *         description: Error interno del servidor
         */
        this.router.route('/test/invoice/authorize')
            .put(this.ctrl.authorizeInvoice);



    }
}

export default SriTestRoutes;

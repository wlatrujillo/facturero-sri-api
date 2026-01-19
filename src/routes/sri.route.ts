

import { SriController } from '@controllers/index.js';
import type { VoucherServiceSri } from '@services/voucher.srv.sri.js';
import { Router } from 'express';

export class SriRoutes {

    router: Router;
    ctrl: SriController;

    constructor(private readonly voucherServiceSri: VoucherServiceSri) {
        this.router = Router();
        this.ctrl = new SriController(this.voucherServiceSri);
        this.routes();
    }

    routes() {



        this.router.route('/test/invoice')
            .post(this.ctrl.generateInvoice);

        this.router.route('/test/invoice/authorize')
            .put(this.ctrl.authorizeInvoice);

        this.router.route('/invoice')
            .post(this.ctrl.generateInvoice);

        this.router.route('/invoice/authorize')
            .put(this.ctrl.authorizeInvoice);



    }
}

export default SriRoutes;

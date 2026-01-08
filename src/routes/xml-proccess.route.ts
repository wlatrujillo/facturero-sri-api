

import { SriController } from '@controllers/index.js';
import { Router } from 'express';

export class SriRoutes {

    router: Router;
    ctrl: SriController;

    constructor() {
        this.router = Router();
        this.ctrl = new SriController();
        this.routes();
    }

    routes() {

        this.router.route('/invoice')
            .post(this.ctrl.generateInvoice);

        this.router.route('/test/invoice')
            .post(this.ctrl.generateInvoice);

    }
}

export default SriRoutes;

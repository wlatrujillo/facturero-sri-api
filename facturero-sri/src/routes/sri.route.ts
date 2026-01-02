

import {Router} from 'express';
import SriController from '../controllers/sri.ctrl.js';

export class SriRoutes {
    
    router: Router; 
    ctrl: SriController;

    constructor() {
        this.router = Router();
        this.ctrl = new SriController();
        this.routes();
    }

    routes() {

        this.router.route('/generateInvoice')
            .post(this.ctrl.generateInvoice);

    }
}

export default SriRoutes;

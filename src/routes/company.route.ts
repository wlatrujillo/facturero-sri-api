

import { Router } from 'express';
import { CompanyController } from '@controllers/companyy.ctrl.js';

export class CompanyRoutes {

    router: Router;
    ctrl: CompanyController;

    constructor() {
        this.router = Router();
        this.ctrl = new CompanyController();
        this.routes();
    }

    routes() {

        this.router.route('/:ruc')
            .get(this.ctrl.getCompanyInfo)

        this.router.route('/')
            .post(this.ctrl.registerCompany);

    }
}

export default CompanyRoutes;

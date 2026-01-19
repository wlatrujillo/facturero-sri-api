

import { Router } from 'express';
import { CompanyController } from '@controllers/index.js';
import type { CompanyService } from '@services/company.srv.js';

export class CompanyRoutes {

    router: Router;
    ctrl: CompanyController;

    constructor(private readonly companyService: CompanyService) {
        this.router = Router();
        this.ctrl = new CompanyController(this.companyService);
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

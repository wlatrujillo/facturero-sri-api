import { Router } from "express";

import CountryController from "../controllers/country.ctrl.js";

export class CountryRoutes {
    router: Router;
    countryController: CountryController;

    constructor() {
        this.router = Router();
        this.countryController = new CountryController();
        this.routes();
    }

    routes() {
        this.router.route('/code/:sCountryISOCode')
            .get(this.countryController.getCountryInfo);
    }
}

export default CountryRoutes;
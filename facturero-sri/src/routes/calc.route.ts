import {Router} from 'express';
import CalcController from '../controllers/calc.ctrl.js';

export class CalcRoutes {
    
    router: Router; 
    calcController: CalcController;

    constructor() {
        this.router = Router();
        this.calcController = new CalcController();
        this.routes();
    }

    routes() {
        this.router.route('/add/:intA/:intB')
            .get(this.calcController.add);
    }
}

export default CalcRoutes;

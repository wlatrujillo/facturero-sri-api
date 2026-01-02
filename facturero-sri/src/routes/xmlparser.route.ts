
import {Router} from 'express';
import { XmlParserController } from '@controllers/index.js';

export class XmlParserRoutes {
    
    router: Router; 
    ctrl: XmlParserController;

    constructor() {
        this.router = Router();
        this.ctrl = new XmlParserController();
        this.routes();
    }

    routes() {

        this.router.route('/xmlToJson')
            .post(this.ctrl.xmlToJson);

        this.router.route('/jsonToXml')
            .post(this.ctrl.jsonToXml);
    }
}

export default XmlParserRoutes;

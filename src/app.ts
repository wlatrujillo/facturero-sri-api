// native
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//external libs
import express from 'express';
import type { Application } from 'express';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import cors from 'cors';
import Log4js from 'log4js';

//Routes
import SriRoutes from './routes/sri.route.js';
import CompanyRoutes from '@routes/company.route.js';
import { checkApiKey } from '@controllers/api-key.ctrl.js';

//Repositories and Services
import { FsStorageService } from '@services/impl/storage.srv.fs.js';
import { CompanyRepository } from '@repository/company.repository.js';
import { CompanyServiceImpl } from '@services/impl/company.srv.impl.js';
import { VoucherServiceSriImpl } from '@services/impl/voucher.srv.sri.impl.js';
import { XmlProccessServiceFacturero } from '@services/impl/xml.process.srv.facturero.js';
import { VoucherRepository } from '@repository/voucher.repository.js';
import { ENVIRONMENT_TYPE } from '@enums/environment.type.js';


class App {

    public app: Application;

    constructor() {
        this.app = express();
        this.logConfig();
        this.serverConfig();
        this.routes();
    }

    private routes(): void {


        const voucherServiceSri = new VoucherServiceSriImpl(
            new XmlProccessServiceFacturero(ENVIRONMENT_TYPE.LIVE),
            new CompanyRepository(),
            new VoucherRepository(ENVIRONMENT_TYPE.LIVE),
            new FsStorageService(ENVIRONMENT_TYPE.LIVE));

        const voucherServiceSriTest = new VoucherServiceSriImpl(
            new XmlProccessServiceFacturero(ENVIRONMENT_TYPE.TEST),
            new CompanyRepository(),
            new VoucherRepository(ENVIRONMENT_TYPE.TEST),
            new FsStorageService(ENVIRONMENT_TYPE.TEST));

        const companyService = new CompanyServiceImpl(new CompanyRepository());

        this.app.get("/", (req, res) => res.render("index", { layout: false, link: "https://facturero-digital.com" }));
        this.app.get("/api/health", (req, res) => res.status(200).send("OK"));
        this.app.use('/api/company', new CompanyRoutes(companyService).router);
        this.app.use('/api/sri', [checkApiKey], new SriRoutes(voucherServiceSri).router);
        this.app.use('/api/sri/test', [checkApiKey], new SriRoutes(voucherServiceSriTest).router);

    }



    private logConfig() {
        Log4js.configure({
            "appenders": {
                "out": {
                    "type": "stdout",
                    "layout": {
                        "type": "pattern",
                        "pattern": "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
                    }
                }
            },
            "categories": {
                "default": {
                    "appenders": ["out"],
                    "level": process.env.log_level || "DEBUG"
                }
            }
        });
    }

    private serverConfig() {

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        this.app.engine('hbs', engine({ extname: '.hbs' }));
        this.app.set('view engine', 'hbs');
        this.app.set('views', __dirname + '/views');
        //limita las peticiones a 50mb
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        //habilita el cors(puertos)
        this.app.use(cors());
        //Seteo de la cabecera de respuesta
        this.app.use((req, res, next) => {
            //Configura las cabeceras de la app
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, UPDATE, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
            res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
            next();
        });
    }


}

export default new App().app;

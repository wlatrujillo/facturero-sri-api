// native


//external libs
import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Application } from 'express';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import cors from 'cors';
import Log4js from 'log4js';

//Routes
import SriRoutes from './routes/sri.route.js';
import CompanyRoutes from './routes/company.route.js';
import { checkApiKey } from './controllers/api-key.ctrl.js';

//Repositories and Services
import { CompanyRepository } from './repository/company.repository.js';
import { CompanyServiceImpl } from './services/impl/company.srv.impl.js';
import { VoucherServiceSriImpl } from './services/impl/voucher.srv.sri.impl.js';
import { VoucherRepository } from './repository/voucher.repository.js';
import { ENVIRONMENT_TYPE } from './enums/environment.type.js';
import { S3StorageService } from './services/impl/storage.srv.s3.js';
import { SriTestRoutes } from './routes/sri.test.route.js';
import { XmlProccessServiceOsoDreamer } from './services/impl/xml.process.srv.osodreamer.js';




class App {

    public app: Application;

    constructor() {
        this.app = express();
        this.logConfig();
        this.serverConfig();
        this.swaggerConfig();
        this.routes();
    }

    private routes(): void {


        const region = process.env.AWS_REGION || "us-east-1";

        const voucherServiceSri = new VoucherServiceSriImpl(
            new XmlProccessServiceOsoDreamer(),
            new CompanyRepository(region),
            new VoucherRepository(region, ENVIRONMENT_TYPE.LIVE),
            new S3StorageService(region, ENVIRONMENT_TYPE.LIVE));

        const voucherServiceSriTest = new VoucherServiceSriImpl(
            new XmlProccessServiceOsoDreamer(),
            new CompanyRepository(region),
            new VoucherRepository(region, ENVIRONMENT_TYPE.TEST),
            new S3StorageService(region, ENVIRONMENT_TYPE.TEST));

        const companyService = new CompanyServiceImpl(new CompanyRepository(region));

        this.app.get("/", (_req, res) => res.render("index", { layout: false, link: "https://facturero-digital.com" }));
        this.app.get("/api/health", (_req, res) => res.status(200).send("OK"));
        this.app.use('/api/company', new CompanyRoutes(companyService).router);
        this.app.use('/api/sri', [checkApiKey], new SriRoutes(voucherServiceSri).router);
        this.app.use('/api/sri-test', [checkApiKey], new SriTestRoutes(voucherServiceSriTest).router);

    }

    private swaggerConfig() {
        // Detect if running from workspace root or package directory
       
        const isWorkspaceRoot = __dirname.includes('/packages/facturero-sri-api/dist');
        const swaggerApiPaths = isWorkspaceRoot
            ? ['./packages/facturero-sri-api/src/routes/*.ts', './packages/facturero-sri-api/src/dtos/*.ts']
            : ['./src/routes/*.ts', './src/dtos/*.ts'];

        // Configuración de Swagger
        const swaggerOptions = {
            definition: {
                openapi: '3.0.0', // Especificar la versión de OpenAPI
                info: {
                    title: 'Facturero SRI API',
                    version: '1.0.0',
                    description: 'Documentación de Facturero SRI API',
                },
                servers: [
                    {
                        url: 'https://sri.facturero-digital.com',
                    },
                    {
                        url: 'http://localhost:8080',
                    }
                ],
            },
            apis: swaggerApiPaths,
        };

        const swaggerDocs = swaggerJsDoc(swaggerOptions);
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
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
                    "level": process.env.LOG_LEVEL || "INFO"
                }
            }
        });
    }

    private serverConfig() {

      

        this.app.engine('hbs', engine({ extname: '.hbs' }));
        this.app.set('view engine', 'hbs');
        this.app.set('views', __dirname + '/views');
        //limita las peticiones a 50mb
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        //habilita el cors(puertos)
        this.app.use(cors());
        //Seteo de la cabecera de respuesta
        this.app.use((_req, res, next) => {
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

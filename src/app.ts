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

class App {

    public app: Application;

    constructor() {
        this.app = express();
        this.logConfig();
        this.serverConfig();
        this.routes();
    }

    private routes(): void {
        
        this.app.get("/", (req, res) => res.render("index", { layout: false, link: "https://facturero-digital.com" }));
        this.app.use('/api/sri', new SriRoutes().router);

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
                    "level": process.env.log_level || "INFO"
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

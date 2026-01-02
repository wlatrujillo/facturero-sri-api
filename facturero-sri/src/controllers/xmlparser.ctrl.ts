
import type { Request, Response } from 'express';
import log4js from 'log4js';

import {  XmlParser }  from '@facturero-sri-signer/index.js';


const logger = log4js.getLogger("XmlParserController");

export class XmlParserController {


    private xmlParserService: XmlParser;

    constructor() {
        logger.info("XmlParserController initialized");
        this.xmlParserService = new XmlParser();
    }

    xmlToJson = async (req: Request, res: Response): Promise<void> => {
        try {

            const xmlData: string = req.body.xmlData;

            const jsonData = await this.xmlParserService.parseXmlToJson(xmlData);

            res.status(200).json({ jsonData });

        } catch (error) {
            logger.error('XmlParser error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    jsonToXml= async (req: Request, res: Response): Promise<void> => {
        try {


            const xmlData = await this.xmlParserService.parseJsonToXml(req.body);

            res.status(200).json({ xmlData });

        } catch (error) {
            logger.error('XmlParser error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}


import type { Request, Response } from 'express';
import log4js from 'log4js';

import SriService from '@services/sri.srv.js';
import type { Invoice } from 'facturero-sri-signer';

const logger = log4js.getLogger("SriController");

export class SriController {


    private sriService: SriService;

    constructor() {
        this.sriService = new SriService();
    }

    generateInvoice = async (req: Request, res: Response): Promise<void> => {
        try {

           logger.info('generateInvoice called');

           const invoice: Invoice = req.body as Invoice;

           invoice.infoFactura.fechaEmision = new Date();

           const xmlData = await this.sriService.generateInvoice(invoice);

           
           res.status(200).json({ xmlData });

        } catch (error) {
            logger.error('generateInvoice error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }



    validateInvoice = async (req: Request, res: Response): Promise<void> => {
        try {

           logger.info('validateInvoice called');

           const { secuencial } = req.params;

           const isValid = await this.sriService.validateInvoice(secuencial);

           res.status(200).json({ isValid });



        } catch (error) {
            logger.error('validateInvoice error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
}

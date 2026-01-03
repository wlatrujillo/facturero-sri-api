

import type { Request, Response } from 'express';
import log4js from 'log4js';

import SriService from '@services/sri.srv.js';
import type { Invoice } from '@facturero-sri-signer/models/invoice.js';

const logger = log4js.getLogger("SriController");

class SriController {


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
    
}

export default SriController;

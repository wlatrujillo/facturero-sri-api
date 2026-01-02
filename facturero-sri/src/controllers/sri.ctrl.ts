

import type { Request, Response } from 'express';
import log4js from 'log4js';

import { InvoiceGenerator } from '@facturero-sri-signer/index.js';

const logger = log4js.getLogger("SriController");

class SriController {


    private invoiceGenerator: InvoiceGenerator;

    constructor() {
        this.invoiceGenerator = new InvoiceGenerator();
    }

    generateInvoice = async (req: Request, res: Response): Promise<void> => {
        try {

           logger.info('generateInvoice called with body:', req.body);

           const xmlData = await this.invoiceGenerator.generateInvoice(req.body);

           res.status(200).json({ xmlData });

        } catch (error) {
            logger.error('generateInvoice error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
}

export default SriController;

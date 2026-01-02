import type { Request, Response } from 'express';
import { createClientAsync } from 'soap';
import log4js from 'log4js';

const logger = log4js.getLogger("BaseController");

const URL_CALC_WSDL = 'http://dneonline.com/calculator.asmx?wsdl';

class CalcController {

    constructor() {
        logger.info("CalcController initialized");
    }

    add = async (req: Request, res: Response): Promise<void> => {
        try {
            const intA = Number(req.params.intA);
            const intB = Number(req.params.intB);

            if (isNaN(intA) || isNaN(intB)) {
                res.status(400).json({ error: 'intA and intB must be numbers' });
                return;
            }

            const client = await createClientAsync(URL_CALC_WSDL);
            const [result] = await client.AddAsync({ intA, intB });

            logger.info('SOAP method result:', result);
            res.status(200).json(result);

        } catch (error) {
            logger.error('SOAP error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default CalcController;
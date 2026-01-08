
import type { Request, Response } from 'express';
import log4js from 'log4js';

import { CompanyService } from "@services/company.srv.js";


const logger = log4js.getLogger("CompanyController");

export class CompanyController {

    private companyService: CompanyService;

    constructor() {
        logger.info('CompanyController initialized');
        this.companyService = new CompanyService();
    }

    getCompanyInfo = async (req: Request, res: Response) => {
        const ruc = req.params.ruc;
        try {

            
            if (!ruc) {
                return res.status(400).json({ error: 'RUC is required' });
            }


            const companyInfo = await this.companyService.returnCompanyInfo(ruc);
            if (!companyInfo) {
                return res.status(404).json({ error: 'Company not found' });
            }
            return res.status(200).json(companyInfo);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    registerCompany = async (req: Request, res: Response) => {
        const companyData = req.body;
        try {
            const apiKey = await this.companyService.registerCompany(companyData);
            return res.status(201).json({ apiKey });
        } catch (error) {
            logger.error('Error registering company:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
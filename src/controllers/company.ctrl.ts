
import type { Request, Response } from 'express';
import log4js from 'log4js';

import type { CompanyService } from '@services/company.srv.js';


const logger = log4js.getLogger("CompanyController");

export class CompanyController {


    constructor(private readonly companyService: CompanyService) {
        logger.debug('CompanyController initialized');
    }

    getCompanyInfo = async (req: Request, res: Response) => {
        const ruc = req.params.ruc;
        try {


            if (!ruc) {
                return res.status(400).json({
                    status: "error",
                    message: 'RUC is required'
                });
            }

            const companyId:string = ruc as string;
            const companyInfo = await this.companyService.findCompany(companyId);

            if (!companyInfo) {
                return res.status(404).json({
                    status: "error",
                    message: 'Company not found'
                });
            }
            return res.status(200).json(companyInfo);
        } catch (error: Error | any) {
            res.status(500).send({
                status: "error",
                message: error instanceof Error ? error.message : String(error),
                errors: error.errors ? error.errors : undefined
            });
        }
    }

    registerCompany = async (req: Request, res: Response) => {
        const companyData = req.body;
        try {
            const apiKey = await this.companyService.createCompany(companyData);
            return res.status(201).json({ apiKey });
        } catch (error: Error | any) {
            res.status(500).send({
                status: "error",
                message: error instanceof Error ? error.message : String(error),
                errors: error.errors ? error.errors : undefined
            });
        }
    }
}
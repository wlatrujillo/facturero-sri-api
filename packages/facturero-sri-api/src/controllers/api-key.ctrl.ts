import type { Request, Response, NextFunction } from "express";


import { CompanyServiceImpl } from "../services/impl/company.srv.impl.js";
import { CompanyRepository } from "../repository/company.repository.js";


export const checkApiKey = async (req: Request, res: Response, next: NextFunction) => {

    const companyService = new CompanyServiceImpl(new CompanyRepository());

    const apiKey = req.header('X-API-Key');

    if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

    try {
        const authorized = await companyService.validateApiKey(apiKey);
        if (authorized) {
            res.locals.companyId = apiKey.split('_')[0] || '';
            return next();
        }

    } catch (error) {
        return res.status(400).json({ error: 'Not authorized' });
    }

};
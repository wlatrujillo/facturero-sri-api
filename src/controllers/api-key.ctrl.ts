import type { Request, Response, NextFunction } from "express";

import { CompanyService } from "@services/company.srv.js";


export const checkApiKey = async (req: Request, res: Response, next: NextFunction) => {

    const companyService = new CompanyService();

    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

    const authorized = await companyService.checkApiKey(apiKey);

    if (authorized) {
        res.locals.companyId = apiKey.split('_')[0] || '';
        return next();
    }

    return res.status(401).json({ error: 'Invalid API key' });
};
import type { Request, Response, NextFunction } from "express";

import { ApiKey } from "@model/api-key.js";

export const checkApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

    const companyId = apiKey.split('_')[0] || '';

    const keys = await ApiKey.find({ companyId: companyId, status: 'ACTIVE' });

    if(!keys || keys.length === 0) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    for (const key of keys) {
        if (apiKey === key.keyHash) {
            key.lastUsedAt = new Date();
            await key.save();
            res.locals.companyId = companyId;
            return next();
        }
    }

    return res.status(401).json({ error: 'Invalid API key' });
};
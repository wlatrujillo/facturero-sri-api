
import type { VoucherServiceSri } from '@services/voucher.srv.sri.js';
import type { Request, Response } from 'express';

import log4js from 'log4js';



const logger = log4js.getLogger("SriController");
/**
 * Controlador responsable de generar, firmar, validar y autorizar un comprobante XML.
 * Esta clase sirve como ejemplo principal de uso de la librería de firmado SRI.
 */
export class SriController {


  constructor(private readonly voucherServiceSri: VoucherServiceSri) {
    logger.debug('SriController initialized');
  }

  generateInvoice = async (req: Request, res: Response): Promise<void> => {
    logger.debug('generateInvoice called');
    try {

      const companyId = res.locals.companyId;


      const invoiceData = req.body;

      logger.info(`Received invoice data for companyId: ${companyId}`);

      await this.voucherServiceSri.executeInvoice(companyId, invoiceData);
     
      res.status(200).send({
        message: "Invoice processed successfully",
        status: "success"
      });

    } catch (error: Error | any) {
      res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        errors: error.errors ? error.errors : undefined
      });
    }
  }

  authorizeInvoice = async (req: Request, res: Response): Promise<void> => {
    logger.debug('authorizeInvoice called');
    try {

      const companyId = res.locals.companyId;


      const accessKey = req.body.accessKey;

      if (!accessKey) {
        res.status(400).send({
          status: "error",
          message: "Access key is required"
        });
        return;
      }

      logger.info(`Received invoice data for authorization for companyId: ${companyId}`);

      await this.voucherServiceSri.authorizeVoucher(companyId, accessKey);

      res.status(200).send({
        message: "Invoice authorized successfully",
        status: "success"
      });

    } catch (error: Error | any) {
      res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        errors: error.errors ? error.errors : undefined
      });
    }
  }





}
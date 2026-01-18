
import type { Request, Response } from 'express';

import log4js from 'log4js';

import { InvoiceSriService } from '@services/invoice.sri.srv.js';
import { StorageService } from '@services/storage.srv.js';
import { XmlProccessService } from '@services/xml-proccess.srv.js';

import { FsRepository } from '@repository/fs.repository.js';

const logger = log4js.getLogger("SriController");
/**
 * Controlador responsable de generar, firmar, validar y autorizar un comprobante XML.
 * Esta clase sirve como ejemplo principal de uso de la librería de firmado SRI.
 */
export class SriController {

  private _invoiceSriService: InvoiceSriService;

  constructor() {
    logger.debug('SriController initialized');
    this._invoiceSriService = new InvoiceSriService(new XmlProccessService(), new StorageService(new FsRepository()));
  }


  generateTestInvoice = async (req: Request, res: Response): Promise<void> => {
    logger.debug('generateTestInvoice called');
    try {

      const companyId = res.locals.companyId;

      const invoiceData = req.body;

      await this._invoiceSriService.executeInvoice(companyId, 'test', invoiceData);

      res.status(200).send({
        status: "success",
        message: "Test invoice processed successfully"
      });

    } catch (error: any) {

      res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        errors: error.errors ? error.errors : undefined
      });
    }
  }

  generateInvoice = async (req: Request, res: Response): Promise<void> => {
    logger.debug('generateInvoice called');
    try {

      const companyId = res.locals.companyId;

      const invoiceData = req.body;

      await this._invoiceSriService.executeInvoice(companyId, 'prod', invoiceData);

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

}
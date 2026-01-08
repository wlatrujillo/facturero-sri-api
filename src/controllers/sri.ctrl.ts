
import type { Request, Response } from 'express';

import { InvoiceSriService } from '@services/invoice.sri.srv.js';
import { StorageService } from '@services/storage.srv.js';
import { XmlProccessService } from '@services/xml-proccess.srv.js';

import log4js from 'log4js';

/**
 * Controlador responsable de generar, firmar, validar y autorizar un comprobante XML.
 * Esta clase sirve como ejemplo principal de uso de la librería de firmado SRI.
 */
export class SriController {


  private readonly logger = log4js.getLogger('SriController');

  private _invoiceSriService: InvoiceSriService;

  constructor() { 
    this._invoiceSriService = new InvoiceSriService(new XmlProccessService(), new StorageService());
  }


  generateTestInvoice = async (req: Request, res: Response): Promise<void> => {
    try {

      const companyId = res.locals.companyId;

      const invoiceData = req.body;

      this._invoiceSriService.executeInvoice(companyId, 'test', invoiceData);
      res.status(200).send("Test invoice processed successfully");
    } catch (error) {
      this.logger.error("❌ Error durante el proceso:", error);
      res.status(500).send("Error processing invoice");
    }
  }

  generateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {

      const companyId = res.locals.companyId;

      const invoiceData = req.body;

      this._invoiceSriService.executeInvoice(companyId, 'prod', invoiceData);
      res.status(200).send("Invoice processed successfully");

    } catch (error) {
      this.logger.error("❌ Error durante el proceso:", error);
      res.status(500).send("Error processing invoice");
    }
  }


  

}

import type { AddInvoiceRequest } from '../dtos/add.invoice.request.js';
import type { AddVoucherResponse } from '../dtos/add.voucher.response.js';
import type { AuthVoucherResponse } from '../dtos/auth.voucher.response.js';
import { VoucherResponse } from '../dtos/voucher.response.js';
import type { ENVIRONMENT_TYPE } from '../enums/environment.type.js';
import type { VoucherServiceSri } from '../services/voucher.srv.sri.js';
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

  generateInvoice = async (req: Request, res: Response): Promise<Response> => {

    try {

      const companyId = res.locals.companyId;



      const environment = req.path.includes('/test/') ? 'TEST' : 'LIVE';

      const invoiceData: AddInvoiceRequest = req.body;

      logger.debug(`Received invoice data for invoice generation for companyId: ${companyId} environment: ${environment}`);

      const serviceResponse: AddVoucherResponse = await this.voucherServiceSri.executeInvoice(companyId, environment as ENVIRONMENT_TYPE, invoiceData);


      const response: AddVoucherResponse = {
        accessKey: serviceResponse.accessKey,
        status: serviceResponse.status,
        errors: serviceResponse.errors
      };


      return res.status(200).send(response);

    } catch (error: Error | any) {
      logger.error('Error in generateInvoice:', error);
      return res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        errors: error.errors ? error.errors : undefined
      });
    }
  }

  generateSignedInvoice = async (req: Request, res: Response): Promise<Response> => {
    logger.debug('generateSignedInvoice called');
    try {

      const companyId = res.locals.companyId;

      const environment = req.path.includes('/test/') ? 'TEST' : 'LIVE';

      logger.debug(`Received invoice data for signed invoice generation for companyId: ${companyId} environment: ${environment}`);

      const invoiceData: AddInvoiceRequest = req.body;

      const response: VoucherResponse = await this.voucherServiceSri.generateSignedInvoice(companyId, environment as ENVIRONMENT_TYPE, invoiceData);


      return res.status(200).send(response);

    } catch (error: Error | any) {
      logger.error('Error in generateSignedInvoice:', error);
      return res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        errors: error.errors ? error.errors : undefined
      });
    }
  }

  authorizeInvoice = async (req: Request, res: Response): Promise<Response> => {
    logger.debug('authorizeInvoice called');
    try {

      const companyId = res.locals.companyId;

      const environment = req.path.includes('/sri-test/') ? 'TEST' : 'LIVE';

      const accessKey = req.body.accessKey;

      if (!accessKey) {
        res.status(400).send({
          status: "error",
          message: "Access key is required"
        });
        return res;
      }

      logger.info(`Received invoice data for authorization for companyId: ${companyId}`);

      const serviceResponse: AuthVoucherResponse = await this.voucherServiceSri.authorizeVoucher(companyId, environment as ENVIRONMENT_TYPE, accessKey);

      const response: AuthVoucherResponse = {
        status: serviceResponse.status,
        errors: serviceResponse.errors
      };


      return res.status(200).send(response);

    } catch (error: Error | any) {
      logger.error('Error in authorizeInvoice:', error);
      return res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        errors: error.errors ? error.errors : undefined
      });
    }
  }

}
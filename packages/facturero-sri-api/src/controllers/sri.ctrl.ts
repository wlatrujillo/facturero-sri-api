
import e from 'express';
import type { AddInvoiceRequest } from '../dtos/add.invoice.request.js';
import type { AddVoucherResponse } from '../dtos/add.voucher.response.js';
import { GetVoucherResponse } from '../dtos/get.voucher.response.js';
import { ENVIRONMENT_TYPE } from '../enums/environment.type.js';
import { IVoucherId } from '../model/voucher.id.js';
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



      const environment = req.path.includes('/test/') ? ENVIRONMENT_TYPE.TEST : ENVIRONMENT_TYPE.LIVE;

      const invoiceData: AddInvoiceRequest = req.body;

      logger.debug(`Received invoice data for invoice generation for companyId: ${companyId} environment: ${environment}`);

      const serviceResponse: AddVoucherResponse = await this.voucherServiceSri.executeInvoice(companyId, environment as ENVIRONMENT_TYPE, invoiceData);


      return res.status(200).send(serviceResponse);

    } catch (error: any) {
      logger.error('Error in generateInvoice:', error);
      return res.status(500).send({
        message: error instanceof Error ? error.message : String(error),
        errors: error.errors ? error.errors : [String(error)]
      });
    }
  }

  generateSignedInvoice = async (req: Request, res: Response): Promise<Response> => {
    logger.debug('generateSignedInvoice called');
    try {

      const companyId = res.locals.companyId;

      const environment = req.path.includes('/test/') ? ENVIRONMENT_TYPE.TEST : ENVIRONMENT_TYPE.LIVE;

      logger.debug(`Received invoice data for signed invoice generation for companyId: ${companyId} environment: ${environment}`);

      const invoiceData: AddInvoiceRequest = req.body;

      const response: AddVoucherResponse = await this.voucherServiceSri.generateSignedInvoice(companyId, environment as ENVIRONMENT_TYPE, invoiceData);

      return res.status(200).send(response);

    } catch (error: Error | any) {
      logger.error('Error in generateSignedInvoice:', error);
      return res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  getVoucherStatusByVoucherId = async (req: Request, res: Response): Promise<Response> => {
    logger.debug('getVoucherStatusByVoucherId called req.params:', req.params);
    try {

      const companyId = res.locals.companyId;

      const environment = req.path.includes('/test/') ? ENVIRONMENT_TYPE.TEST : ENVIRONMENT_TYPE.LIVE;

      const voucherId = {
        voucherType: req.params.type instanceof Array ? req.params.type[0] : req.params.type,
        environment: environment,
        establishment: req.params.establishment instanceof Array ? req.params.establishment[0] : req.params.establishment,
        branch: req.params.branch instanceof Array ? req.params.branch[0] : req.params.branch,
        sequence: req.params.number instanceof Array ? req.params.number[0] : req.params.number
      } as IVoucherId;

      if (!voucherId.voucherType || !voucherId.environment || !voucherId.establishment || !voucherId.branch || !voucherId.sequence) {
        return res.status(400).send({
          status: "error",
          message: "Invalid voucher ID"
        });
      }

      logger.info(`Received request for voucher status for companyId: ${companyId}, voucherId: ${JSON.stringify(voucherId)}`);

      const serviceResponse: GetVoucherResponse = await this.voucherServiceSri.getVoucherStatusByVoucherId(companyId, voucherId);


      if (!serviceResponse || !serviceResponse.accessKey) {
        return res.status(404).send({
          status: "error",
          message: "Voucher not found"
        });
      }

      return res.status(200).send(serviceResponse);

    } catch (error: Error | any) {
      logger.error('Error in getVoucherStatus:', error);
      return res.status(500).send({
        status: "error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

}
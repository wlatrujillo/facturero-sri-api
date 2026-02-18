
import { IDENTIFICATION_ENUM, IVA_CODE_ENUM, PAYMENT_METHOD_ENUM, TAX_CODE_ENUM, VOUCHER_TYPE_ENUM } from "../enums";
import { Detalle, Impuesto, Invoice, Pago } from "../models";
import { InfoFactura } from "../models/info-factura";
import { InfoTributaria } from "../models/info-tributaria";
import { CedulaValidator } from "./cedula.validator";

export class InvoiceValidator {
  static validate(invoice: Invoice): string[] {
    console.log("Validating invoice: ", invoice);
    const errors: string[] = [];

    if (!invoice) {
      errors.push("Invoice is required");
    }

    errors.push(...this.validateInfoTributaria(invoice.infoTributaria));
    errors.push(...this.validateInfoFactura(invoice.infoFactura));
    errors.push(...this.validateImpuestos(invoice.infoFactura.totalConImpuestos));
    errors.push(...this.validateDetalles(invoice.detalles));
    errors.push(...this.validatePagos(invoice.infoFactura.pagos));
    errors.push(...this.validateInfoAdicional(invoice.infoAdicional));

    return errors;
  }

  static validateInfoTributaria(infoTributaria: InfoTributaria): string[] {
    const errors: string[] = [];

    if (!infoTributaria) {
      errors.push("infoTributaria is required");
      return errors;
    }

    if (!infoTributaria.razonSocial) {
      errors.push("infoTributaria.razonSocial is required");
    }

    if (!infoTributaria.ruc) {
      errors.push("infoTributaria.ruc is required");
    }

    if (infoTributaria.ruc && !/^\d{13}$/.test(infoTributaria.ruc)) {
      errors.push("infoTributaria.ruc must be a 13-digit number");
    }

    const validCodDoc = VOUCHER_TYPE_ENUM.FACTURA; // Código para factura
    if (infoTributaria.codDoc && infoTributaria.codDoc !== validCodDoc) {
      errors.push(`infoTributaria.codDoc must be ${validCodDoc}`);
    }

    return errors;
  }

  static validateInfoFactura(infoFactura: InfoFactura): string[] {
    const errors: string[] = [];

    if (!infoFactura) {
      errors.push("infoFactura is required");
      return errors;
    }

    if (!infoFactura.fechaEmision) {
      errors.push("infoFactura.fechaEmision is required");
    }

    if (!infoFactura.tipoIdentificacionComprador) {
      errors.push("infoFactura.tipoIdentificacionComprador is required");
    }

    const validIdentificationTypes = Object.values(IDENTIFICATION_ENUM);
    if (infoFactura.tipoIdentificacionComprador && !validIdentificationTypes.includes(infoFactura.tipoIdentificacionComprador)) {
      errors.push(`infoFactura.tipoIdentificacionComprador must be one of: ${validIdentificationTypes.join(", ")}`);
    }

    if (infoFactura.tipoIdentificacionComprador === IDENTIFICATION_ENUM.CEDULA &&
      infoFactura.identificacionComprador &&
      !CedulaValidator.isValid(infoFactura.identificacionComprador)) {
      errors.push("infoFactura.identificacionComprador is not a valid Ecuadorian cédula");
    }

    if (!infoFactura.razonSocialComprador) {
      errors.push("infoFactura.razonSocialComprador is required");
    }

    if (infoFactura.totalSinImpuestos === undefined || infoFactura.totalSinImpuestos === null) {
      errors.push("infoFactura.totalSinImpuestos is required");
    }

    if (infoFactura.totalDescuento === undefined || infoFactura.totalDescuento === null) {
      errors.push("infoFactura.totalDescuento is required");
    }

    if (infoFactura.totalConImpuestos === undefined || infoFactura.totalConImpuestos === null) {
      errors.push("infoFactura.totalConImpuestos is required");
    }


    if (infoFactura.importeTotal === undefined || infoFactura.importeTotal === null) {
      errors.push("infoFactura.importeTotal is required");
    }

    return errors;
  }

  static validateDetalles(detalles: any[]): string[] {
    const errors: string[] = [];

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      errors.push("detalles must be a non-empty array");
      return errors;
    }

    detalles.forEach((detalle: Detalle, index: number) => {
      if (!detalle.codigoPrincipal) {
        errors.push(`detalles[${index}].codigoPrincipal is required`);
      }
      if (detalle.cantidad === undefined || detalle.cantidad === null) {
        errors.push(`detalles[${index}].cantidad is required`);
      }
      if (detalle.precioUnitario === undefined || detalle.precioUnitario === null) {
        errors.push(`detalles[${index}].precioUnitario is required`);
      }
      if (detalle.precioTotalSinImpuesto === undefined || detalle.precioTotalSinImpuesto === null) {
        errors.push(`detalles[${index}].precioTotalSinImpuesto is required`);
      }
      if (!detalle.impuestos || !Array.isArray(detalle.impuestos) || detalle.impuestos.length === 0) {
        errors.push(`detalles[${index}].impuestos must be a non-empty array`);
      }

      errors.push(...this.validateImpuestos(detalle.impuestos));

    });

    return errors;
  }

  static validatePagos(pagos: Pago[]): string[] {
    const errors: string[] = [];

    if (!pagos || !Array.isArray(pagos) || pagos.length === 0) {
      errors.push("pagos must be a non-empty array");
      return errors;
    }

    const validPaymentMethods = Object.values(PAYMENT_METHOD_ENUM);

    pagos.forEach((pago, index) => {
      if (!pago.formaPago) {
        errors.push(`pagos[${index}].formaPago is required`);
      }
      if (pago.total === undefined || pago.total === null) {
        errors.push(`pagos[${index}].total is required`);
      }
      if (pago.formaPago && !validPaymentMethods.includes(pago.formaPago)) {
        errors.push(`pagos[${index}].formaPago must be one of: ${validPaymentMethods.join(", ")}`);
      }
    });

    return errors;
  }


  static validateInfoAdicional(infoAdicional: any[]): string[] {
    const errors: string[] = [];

    if (!infoAdicional || !Array.isArray(infoAdicional) || infoAdicional.length === 0) {
      errors.push("infoAdicional must be a non-empty array");
      return errors;
    }
    const email = infoAdicional.find(info => info.nombre === "Email");
    if (!email) {
      errors.push("infoAdicional with nombre 'Email' is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.valor)) {
      errors.push("infoAdicional with nombre 'Email' must have a valid email format");
    }

    return errors;
  }

  static validateImpuestos(impuestos: Impuesto[]): string[] {
    const errors: string[] = [];
    const validTaxCodes = Object.values(TAX_CODE_ENUM);
    const validIvaCodes = Object.values(IVA_CODE_ENUM);

    impuestos.forEach((impuesto, index) => {
      if (!impuesto.codigo) {
        errors.push(`impuestos[${index}].codigo is required`);
      }
      if (!impuesto.codigoPorcentaje) {
        errors.push(`impuestos[${index}].codigoPorcentaje is required`);
      }

      if (impuesto.codigo && !validTaxCodes.includes(impuesto.codigo)) {
        errors.push(`impuestos[${index}].codigo must be one of: ${validTaxCodes.join(", ")}`);
      }
      if (impuesto.codigo == TAX_CODE_ENUM.IVA) {
        if (!validIvaCodes.includes(impuesto.codigoPorcentaje)) {
          errors.push(`impuestos[${index}].codigoPorcentaje must be one of: ${validIvaCodes.join(", ")}`);
        }
      }
    });

    return errors;
  }

}
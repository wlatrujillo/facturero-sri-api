export class InvoiceGeneratorException extends Error {
  constructor(public readonly errors: string[]) {
    super('InvoiceGeneratorException: Se encontraron errores al generar el xml de la factura.');
  }
}
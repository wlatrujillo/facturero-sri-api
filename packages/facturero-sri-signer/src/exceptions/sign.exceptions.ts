export class SigningKeyNotFoundError extends Error {
  constructor(friendlyName: string) {
    super(
      `No se encontró la clave de firma para el certificado: ${friendlyName}`
    );
    this.name = "SigningKeyNotFoundError";
  }
}

export class PrivateKeyExtractionError extends Error {
  constructor(sourceLabel = "archivo P12") {
    super(`No se pudo extraer la clave privada desde ${sourceLabel}.`);
    this.name = "PrivateKeyExtractionError";
  }
}

export class UanatacaCertificateNotFoundError extends Error {
  constructor() {
    super("No se encontró el certificado para UANATACA.");
    this.name = "UanatacaCertificateNotFoundError";
  }
}

export class UnknownSignStrategyError extends Error{
  constructor(friendlyName: string) {
    super(`No existe estrategia para el certificado: ${friendlyName}`);
    this.name = "UnknownSignStrategyError";
  }
}

import { DateFormat } from "../utils/date.format.js";

export class AccessKeyGenerator {
  static generateAccessKey(
    fechaEmision: Date,
    codDoc: string,
    ruc: string,
    ambiente: 1|2 = 1,
    estab: string,
    ptoEmi: string,
    secuencial: string,
    tipoEmision: number = 1,
  ): string {
    const PAD_FILLER = "0";

    if (!fechaEmision) {
      throw new Error("fechaEmision is required");
    }

    if (!codDoc) {
      throw new Error("codDoc is required");
    }

    if (!ruc) {
      throw new Error("ruc is required");
    }

    if (ambiente === null || ambiente === undefined) {
      throw new Error("ambiente is required");
    }

    if (!estab) {
      throw new Error("estab is required");
    }

    if (!ptoEmi) {
      throw new Error("ptoEmi is required");
    }

    if (!secuencial) {
      throw new Error("secuencial is required");
    }


    try {


      const issueDate = DateFormat.formatDateDDMMYYYY(fechaEmision);
      const documentType = this.padLeft(codDoc, 2, PAD_FILLER);
      const identification = this.padLeft(ruc, 13, PAD_FILLER);
      const env = this.padLeft(ambiente, 1, PAD_FILLER);
      const establishment = this.padLeft(estab, 3, PAD_FILLER);
      const branch = this.padLeft(ptoEmi, 3, PAD_FILLER);
      const sequential = this.padLeft(secuencial, 9, PAD_FILLER);


      const codigoNumerico8Digits =
        DateFormat.formatDateDDMM(fechaEmision) +
        sequential.slice(-2) +
        this.randomNumericString(2);

      const emissionType = this.padLeft(tipoEmision, 1, PAD_FILLER);

      const rawKey = `${issueDate}${documentType}${identification}${env}${establishment}${branch}${sequential}${codigoNumerico8Digits}${emissionType}`;

      const digitVerifier = this.getModule11VerifierDigit(rawKey);

      return rawKey + digitVerifier;

    } catch (error: any) {
      throw new Error(`Error generating access key: ${error.message}`);
    }
  }

  private static padLeft(
    value: number | string,
    length: number,
    padChar: string,
  ): string {
    if (value === null || value === undefined) {
      throw new Error(`Value cannot be null or undefined`);
    }
    let strValue = value.toString();
    while (strValue.length < length) {
      strValue = strValue.padStart(length, padChar);
    }
    return strValue;
  }

  private static randomNumericString(digits: number): string {
    return Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, "0");
  }

  private static getModule11VerifierDigit(rawKey: string): string {
    // calcular digito modulo 11 segun reglas del SRI

    if (!/^\d{48}$/.test(rawKey)) return "-1";

    const digitos = rawKey.split("").map(Number);

    let reduced = digitos.reduce(
      (total, valor, i) => total + valor * (7 - (i % 6)),
      0,
    );

    let digito = 11 - (reduced % 11);

    return digito === 11 ? "0" : digito === 10 ? "1" : digito.toString();
  }
}


import { DateFormat } from "../utils/date.format.js";

export class AccessKeyGenerator {


    static generateAccessKey(fechaEmision: Date, 
        codDoc: string, 
        ruc: string, 
        ambiente: number,
        estab: string,
        ptoEmi: string,
        secuencial: string,
        tipoEmision: number
    ): string {

        const PAD_FILLER = '0';

        const issueDate = DateFormat.formatDateDDMMYYYY(fechaEmision);
        const documentType = this.padLeft(codDoc, 2, PAD_FILLER);
        const identification = this.padLeft(ruc, 13, PAD_FILLER);
        const env = this.padLeft(ambiente, 1, PAD_FILLER);
        const establishment = this.padLeft(estab, 3, PAD_FILLER);
        const branch = this.padLeft(ptoEmi, 3, PAD_FILLER);
        const sequential = this.padLeft(secuencial, 9, PAD_FILLER);

        
        const codigoNumerico = String(fechaEmision.getDate()).padStart(2, '0') +
            String(fechaEmision.getMonth() + 1).padStart(2, '0') + 
            this.randomNumericString().padStart(4, '0');

        const emissionType = this.padLeft(tipoEmision, 1, PAD_FILLER);

        const rawKey = `${issueDate}${documentType}${identification}${env}${establishment}${branch}${sequential}${codigoNumerico}${emissionType}`;

        const digitVerifier = this.calculateDigitVerifierModulo11(rawKey); 

        return rawKey + digitVerifier;
    }


    private static padLeft(value: number | string, length: number, padChar: string): string {
        let strValue = value.toString();
        while (strValue.length < length) {
            strValue = strValue.padStart(length, padChar);
        }
        return strValue;
    }


    private static randomNumericString(): string {
       return  Math.floor(Math.random() * 9000).toString();
    }

    private static calculateDigitVerifierModulo11(rawKey: string): string {
        // calcular digito modulo 11 segun reglas del SRI

        if (!/^\d{48}$/.test(rawKey)) return '-1';

        const digitos = rawKey.split("").map(Number);

        let reduced = digitos
            .reduce((total, valor, i) => total + valor * (7 - (i % 6)), 0);

        let digito = 11 - (reduced % 11);

        return digito === 11 ? '0' : digito === 10 ? '1' : digito.toString();
    }

}
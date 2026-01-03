import type { InfoTributaria } from "../models/info-tributaria.js";

export class AccessKeyGenerator {


    generateAccessKey(infoTributaria: InfoTributaria, issueDate: Date): string {

        const PAD_FILLER = '0';

        const fechaEmision = this.formatDateDDMMYYYY(issueDate);
        const codDoc = this.padLeft(infoTributaria.codDoc, 2, PAD_FILLER);
        const ruc = this.padLeft(infoTributaria.ruc, 13, PAD_FILLER);
        const ambiente = this.padLeft(infoTributaria.ambiente, 1, PAD_FILLER);
        const estab = this.padLeft(infoTributaria.estab, 3, PAD_FILLER);
        const ptoEmi = this.padLeft(infoTributaria.ptoEmi, 3, PAD_FILLER);
        const secuencial = this.padLeft(infoTributaria.secuencial, 9, PAD_FILLER);

        
        const codigoNumerico = String(issueDate.getDate()).padStart(2, '0') +
            String(issueDate.getMonth() + 1).padStart(2, '0') + 
            this.randomNumericString().padStart(4, '0');

        const tipoEmision = this.padLeft(infoTributaria.tipoEmision, 1, PAD_FILLER);

        const rawKey = `${fechaEmision}${codDoc}${ruc}${ambiente}${estab}${ptoEmi}${secuencial}${codigoNumerico}${tipoEmision}`;

        const digitVerifier = this.calculateDigitVerifierModulo11(rawKey); 

        return rawKey + digitVerifier;
    }


    private padLeft(value: number | string, length: number, padChar: string): string {
        let strValue = value.toString();
        while (strValue.length < length) {
            strValue = strValue.padStart(length, padChar);
        }
        return strValue;
    }

    private formatDateDDMMYYYY(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}${month}${year}`;
    }

    private randomNumericString(): string {
       return  Math.floor(Math.random() * 9000).toString();
    }

    private calculateDigitVerifierModulo11(rawKey: string): string {
        // calcular digito modulo 11 segun reglas del SRI

        if (!/^\d{48}$/.test(rawKey)) return '-1';

        const digitos = rawKey.split("").map(Number);

        let reduced = digitos
            .reduce((total, valor, i) => total + valor * (7 - (i % 6)), 0);

        let digito = 11 - (reduced % 11);

        return digito === 11 ? '0' : digito === 10 ? '1' : digito.toString();
    }

}
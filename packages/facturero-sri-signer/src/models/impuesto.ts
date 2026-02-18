import { TAX_CODE_ENUM } from "../enums";

export interface Impuesto {
    codigo: TAX_CODE_ENUM;
    codigoPorcentaje: number;
    tarifa: number;
    baseImponible: number;
    valor: number;

}

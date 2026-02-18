import { ENVIRONMENT_ENUM } from "../enums";

export interface InfoTributaria {

    ambiente: ENVIRONMENT_ENUM;
    tipoEmision: number;
    razonSocial: string;
    nombreComercial: string;
    ruc: string;
    codDoc: string;
    estab: string;
    ptoEmi: string;
    secuencial: string;
    dirMatriz: string;
    claveAcceso?: string;

}

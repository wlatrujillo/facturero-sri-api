
import { IDENTIFICATION_ENUM } from '../enums/identification.enum.js';
import type { Impuesto} from './impuesto.js';
import type { Pago } from './pago.js';

export interface InfoFactura {

    fechaEmision: Date;
    dirEstablecimiento: string;
    contribuyenteEspecial: string;
    obligadoContabilidad: "SI" | "NO";
    tipoIdentificacionComprador: IDENTIFICATION_ENUM;
    razonSocialComprador: string;
    identificacionComprador: string;
    guiaRemision: string;
    totalSinImpuestos: number;
    totalDescuento: number;
    totalConImpuestos: Impuesto[];
    propina: number;
    importeTotal: number;
    moneda: string;
    pagos: Pago[];
    valorRetIva: number;
    valorRetRenta: number;

}

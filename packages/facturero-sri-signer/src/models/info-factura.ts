
import type { Impuesto} from './impuesto.js';
import type { Pago } from './pago.js';

export interface InfoFactura {

    fechaEmision: Date;
    dirEstablecimiento: string;
    contribuyenteEspecial: string;
    obligadoContabilidad: string;
    tipoIdentificacionComprador: string;
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

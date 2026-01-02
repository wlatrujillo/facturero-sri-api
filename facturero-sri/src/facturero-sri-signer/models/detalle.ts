import type { Impuesto } from "./impuesto.js";

export interface Detalle {

    codigoPrincipal: string;
    codigoAuxiliar: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    precioTotalSinImpuesto: number;
    detallesAdicionales: { nombre: string; valor: string }[];
    impuestos: Impuesto[];

}

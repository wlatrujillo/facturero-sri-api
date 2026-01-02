import type { Detalle } from "./detalle.js";
import type { InfoFactura } from "./info-factura.js";
import type { InfoTributaria } from "./info-tributaria.js";

export interface Invoice {

    infoTributaria: InfoTributaria;
    infoFactura: InfoFactura;
    detalles: Detalle[];
    infoAdicional: any[];

}
import { PAYMENT_METHOD_ENUM } from "../enums";

export interface Pago {

    formaPago: PAYMENT_METHOD_ENUM;
    total: number;
    plazo: number;
    unidadTiempo: string;
}

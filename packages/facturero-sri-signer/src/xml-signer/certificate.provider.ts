import { P12Certificate } from "../models/p12.certificate.js";

export interface CertificateProvider{

    getData(p12Buffer: Uint8Array, password: string): Promise<P12Certificate>;
}
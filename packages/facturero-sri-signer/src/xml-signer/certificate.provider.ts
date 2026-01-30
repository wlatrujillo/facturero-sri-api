import { P12Certificate } from "../models/p12.certificate.js";

export interface CertificateProvider{

    getData(): Promise<P12Certificate>;
}
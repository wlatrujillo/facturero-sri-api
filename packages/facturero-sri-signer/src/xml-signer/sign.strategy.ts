import * as forge from "node-forge";

export interface SignStrategy {
    supports(friendlyName: string): boolean;

    getPrivateKey(bags: any): forge.pki.PrivateKey | forge.asn1.Asn1;

    overrideIssuerName(certBags: forge.pkcs12.Bag[]): string;
}
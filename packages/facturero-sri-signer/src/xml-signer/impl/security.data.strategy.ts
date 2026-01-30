import * as forge from "node-forge";
import { SignStrategy } from "../sign.strategy.js";

import {
    PrivateKeyExtractionError,
    SigningKeyNotFoundError,
} from "../../exceptions/index.js";


export class SecurityDataStrategy implements SignStrategy {
    supports(friendlyName: string): boolean {
        return /SECURITY DATA/i.test(friendlyName);
    }

    getPrivateKey(
        bags: forge.pkcs12.Bag[]
    ): forge.pki.PrivateKey | forge.asn1.Asn1 {
        const item = bags[0];
        if (!item) throw new SigningKeyNotFoundError("SECURITY DATA");
        if (item?.key) {
            return item.key;
        } else if (item?.asn1) {
            return forge.pki.privateKeyFromAsn1(item.asn1);
        } else {
            throw new PrivateKeyExtractionError();
        }
    }

    overrideIssuerName(certBags: forge.pkcs12.Bag[]): string {
        const cert = certBags[forge.pki.oids.certBag][0].cert;
        return cert.issuer.attributes
            .reverse()
            .map((attr: any) => `${attr.shortName}=${attr.value}`)
            .join(",");
    }
}
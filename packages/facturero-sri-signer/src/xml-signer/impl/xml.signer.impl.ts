
import { SignedXml } from 'xml-crypto';
import forge from 'node-forge';

import { XmlSigner } from '../xml.signer.js';


export class XmlSignerImpl implements XmlSigner{
    // Lógica para firmar el XML

    signXml = (p12Buffer: Buffer, password: string, xmlBuffer: Buffer): string => {


        const { privateKey, certificate } =
            this.loadPrivateKey(p12Buffer, password);

        const sig = new SignedXml({
            privateKey,
            signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
            canonicalizationAlgorithm:
                "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
        });

        // Referencia al comprobante
        sig.addReference({
            xpath: "/*",
            transforms: [
                "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
                "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
            ],
            digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
        });

        // KeyInfo
        sig.getKeyInfoContent = () => {
            return `<X509Data><X509Certificate>${certificate
                .replace('-----BEGIN CERTIFICATE-----', '')
                .replace('-----END CERTIFICATE-----', '')
                .replace(/(\r\n|\n|\r)/gm, '')}</X509Certificate></X509Data>`;
        };


        const xmlString = xmlBuffer.toString('utf-8');

        sig.computeSignature(xmlString, {
            location: {
                reference: "/*",
                action: "append"
            }
        });

        return sig.getSignedXml();
    }


    private loadPrivateKey = (p12Buffer: Buffer, password: string): { privateKey: string; certificate: string } => {
        // Lógica para cargar la clave privada desde PEM
        const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

        let privateKey: string = '';
        let certificate: string = '';

        for (const safeContent of p12.safeContents) {
            for (const safeBag of safeContent.safeBags) {
                if (safeBag.key) {
                    privateKey = forge.pki.privateKeyToPem(safeBag.key);
                }
                if (safeBag.cert) {
                    certificate = forge.pki.certificateToPem(safeBag.cert);
                }
            }
        }

        return { privateKey, certificate };
    }

}
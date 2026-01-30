

export interface XmlSigner {

    signXml(p12Buffer: Buffer, password: string, xmlBuffer: Buffer): string;

}
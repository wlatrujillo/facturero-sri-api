export interface StorageService {

    writeCertificateP12(companyId: string, fileContent: Buffer): Promise<void>;

    writeGeneratedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void>;

    writeSignedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void>;

    writeAuthorizedVoucher(companyId: string, accessKey: string, fileContent: Buffer): Promise<void>;

    readCertificateP12(companyId: string): Promise<Buffer>;

    readGeneratedVoucher(companyId: string, accessKey: string): Promise<Buffer>;

    readSignedVoucher(companyId: string, accessKey: string): Promise<Buffer>;

    readAuthorizedVoucher(companyId: string, accessKey: string): Promise<Buffer>;
}
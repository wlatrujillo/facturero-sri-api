

export interface ICompany  {
    companyId: string;
    autorization: string;
    autorizationDate: Date;
    name: string;
    address: string;
    urlLogo: string;
    email: string;
    phone: string;
    active: boolean;
    signaturePassword: string;
    apiKey: IApiKey;
    createdAt: string;
    updatedAt: string;
}

export interface IApiKey  {

    name: string; // e.g. "Backend Integration"
    secret: string;

    environment: 'test' | 'live';

    status: 'ACTIVE' | 'REVOKED';

    usagePlan: 'FREE' | 'STANDARD' | 'PREMIUM';

    updatedAt?: Date;
    createdAt: Date;
}
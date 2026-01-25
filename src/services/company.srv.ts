
import type { IApiKey, ICompany } from '@model/company.js';

export interface CompanyService {
  
    findCompany  (ruc: string) : Promise<ICompany | null>;
    createCompany  (company: ICompany): Promise<IApiKey>;
    validateApiKey (apiKey: string): Promise<boolean>;

}
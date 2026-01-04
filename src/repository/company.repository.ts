import { Company } from "@model/company.js";
import type { ICompany } from "@model/company.js";


class CompanyRepository {

    constructor() { }

    retrieve(criteria: any): Promise<ICompany[]> {
        return new Promise((resolve, reject) => {

            Company.find(criteria).exec()
                .then((result: ICompany[]) => resolve(result))
                .catch((error: any) => reject(error));

        });
    }

    insertOne(item: ICompany): Promise<ICompany> {
        return Company.create(item);
    }


}

Object.seal(CompanyRepository);
export default CompanyRepository;
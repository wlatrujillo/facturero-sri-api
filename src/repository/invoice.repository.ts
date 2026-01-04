import { Invoice } from "@model/invoice.js";
import type { IInvoice } from "@model/invoice.js";


class InvoiceRepository {
    constructor() { }

    retrieve(criteria: any): Promise<IInvoice[]> {
        return new Promise((resolve, reject) => {

            Invoice.find(criteria).exec()
                .then((result: IInvoice[]) => resolve(result))
                .catch((error: any) => reject(error));

        });
    }

    insertOne(item: IInvoice): Promise<IInvoice> {
        return Invoice.create(item);
    }


}

Object.seal(InvoiceRepository);
export default InvoiceRepository;
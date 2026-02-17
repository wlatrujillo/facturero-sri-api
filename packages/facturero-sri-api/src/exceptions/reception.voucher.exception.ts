export class ReceptionVoucherException extends Error {
    constructor(message: string, public readonly errors?: string[]) {
        super(`ReceptionVoucherException:  ${message}`);
        this.name = 'ReceptionVoucherException';
    } 
}
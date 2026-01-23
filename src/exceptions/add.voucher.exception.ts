export class AddVoucherException extends Error {
    constructor(message: string) {
        super(`AddVoucherException: ${message}`);
        this.name = 'AddVoucherException';
    } 
}
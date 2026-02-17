export class AddVoucherException extends Error {
    constructor(message: string, public readonly errors?: any) {
        super(`AddVoucherException: ${message}`);
        this.name = 'AddVoucherException';
    } 
}
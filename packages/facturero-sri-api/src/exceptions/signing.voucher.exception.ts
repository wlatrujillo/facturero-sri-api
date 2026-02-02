export class SigningVoucherException extends Error {
    constructor(message: string) {
        super(`SigningVoucherException: ${message}`);
        this.name = 'SigningVoucherException';
    } 
}
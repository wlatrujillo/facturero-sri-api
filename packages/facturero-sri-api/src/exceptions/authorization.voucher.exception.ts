export class AuthorizationVoucherException extends Error {
    constructor(message: string, public readonly errors?: string[]) {
        super(`AuthorizationVoucherException:  ${message}`);
        this.name = 'AuthorizationVoucherException';
    } 
}
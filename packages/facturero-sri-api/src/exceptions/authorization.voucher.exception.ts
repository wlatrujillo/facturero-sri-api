export class AuthorizationVoucherException extends Error {
    constructor(message: string, errors?: string[]) {
        super(`AuthorizationVoucherException: ${errors ? message + ' Details: ' + errors.join(', ') : message}`);
        this.name = 'AuthorizationVoucherException';
    } 
}
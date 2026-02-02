export class AuthorizationVoucherException extends Error {
    constructor(message: string, messages?: string[]) {
        super(`AuthorizationVoucherException: ${messages ? message + ' Details: ' + messages.join(', ') : message}`);
        this.name = 'AuthorizationVoucherException';
    } 
}
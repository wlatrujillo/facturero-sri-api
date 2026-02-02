export class ValidationVoucherException extends Error {
    constructor(message: string, messages?: string[]) {
        super(`ValidationVoucherException: ${messages ? message + ' Details: ' + messages.join(', ') : message}`);
        this.name = 'ValidationVoucherException';
    } 
}
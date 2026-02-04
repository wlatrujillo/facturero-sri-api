export class ValidationVoucherException extends Error {
    constructor(message: string, errors?: string[]) {
        super(`ValidationVoucherException: ${errors ? message + ' Details: ' + errors.join(', ') : message}`);
        this.name = 'ValidationVoucherException';
    } 
}
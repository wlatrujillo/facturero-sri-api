import type { SriAuthorizationResult } from "../dtos/sri.auth.result.js";
import type { SriValidationResult } from "../dtos/sri.validation.result.js";

export class SriResultMapper {

    static toSriValidationResult(data: any): SriValidationResult {

        return {
            status: data.estado,
            messages: data?.comprobantes?.comprobante.mensajes || []
        };

    }

    static toSriAuthResult(data: any): SriAuthorizationResult {

        return {
            status: data.autorizacion?.estado || '',
            authorizationDate: data.autorizacion?.fechaAutorizacion || '',
            environment: data.autorizacion?.ambiente || '',
            voucher: data.autorizacion?.comprobante || '',
            messages: data.autorizacion?.mensajes || []
        };

    }
}
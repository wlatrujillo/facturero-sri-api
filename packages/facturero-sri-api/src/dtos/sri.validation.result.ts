export interface SriValidationResult {
    status: string;
    sriMessage?: string;
    sriStatus?: string;
    sriErrorIdentifier?: string;
    additionalInfo?: string;
    messages: string[];
}
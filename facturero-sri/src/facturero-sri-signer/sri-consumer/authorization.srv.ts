import { Client, createClientAsync } from 'soap';

import { ENVIRONMENT } from '../enums/index.js';
import { SRI_ENDPOINTS } from '../utils/sri.endopoints.js';
export class AuthorizationService {


    async requestAuthorization(env: ENVIRONMENT, accessKey: string): Promise<any> {

        const URL_SRI_WSDL = env == ENVIRONMENT.PRUEBAS ?
            SRI_ENDPOINTS['PRUEBAS'].AUTHORIZATION :
            SRI_ENDPOINTS['PRODUCCION'].AUTHORIZATION;
        let result: any, rawResponse: any;

        try {
            console.log('Solicitando autorización al SRI...');
            console.log('WSDL URL: ', URL_SRI_WSDL);    
            const client: Client = await createClientAsync(URL_SRI_WSDL);
            [result, rawResponse] = await client.autorizacionComprobanteAsync({ claveAccesoComprobante: accessKey });

        } catch (error) {
            console.error('Error al solicitar la autorización al SRI: ', error);
            throw error;
        }   
        const response = result?.RespuestaAutorizacionComprobante;

        if (!response) {
            throw new Error(
                "Respuesta inválida del SRI (sin 'respuestaAutorizacionComprobante')"
            );
        }   
        const autorizaciones = response.autorizaciones;
        console.log('Autorizaciones del SRI: ', autorizaciones);    
        return autorizaciones;
    }
}
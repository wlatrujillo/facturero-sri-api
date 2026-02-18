import { Client, createClientAsync } from 'soap';

import { ENVIRONMENT_ENUM } from '../enums/index.js';
import { SRI_ENDPOINTS } from '../utils/sri.endpoints.js';
import { SriAuthResponse } from '../dtos/sri.auth.response.js';
export class AuthorizationService {

    async authorizeXml(env: ENVIRONMENT_ENUM, accessKey: string): Promise<SriAuthResponse> {

        const URL_SRI_WSDL = env == ENVIRONMENT_ENUM.PRUEBAS ?
            SRI_ENDPOINTS['PRUEBAS'].AUTHORIZATION :
            SRI_ENDPOINTS['PRODUCCION'].AUTHORIZATION;
        let result: any, rawResponse: any;

        try {
            console.log('WSDL URL: ', URL_SRI_WSDL);
            const client: Client = await createClientAsync(URL_SRI_WSDL);
            [result, rawResponse] = await client.autorizacionComprobanteAsync({ claveAccesoComprobante: accessKey });

            console.log('Resultado de autorización: ', result, 'Respuesta cruda: ', rawResponse);

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

        const autorizaciones = response?.autorizaciones;

        if (!autorizaciones) {
            throw new Error("No se recibió información de autorización del SRI");
        }

        const autorizacion = autorizaciones instanceof Array ? autorizaciones[0] : autorizaciones.autorizacion;
        console.log('Autorizacion: ', autorizacion);

        const mensajes = autorizacion.mensajes instanceof Array ? autorizacion.mensajes : [autorizacion.mensajes];

        return {
            status: autorizacion.estado,
            authorizationDate: autorizacion.fechaAutorizacion,
            voucher: autorizacion.comprobante,
            accessKey: accessKey,
            environment: env,
            sriErrorIdentifier: '',
            messages: mensajes.map((msg: any) => msg?.mensaje) || []
        };

    }
}
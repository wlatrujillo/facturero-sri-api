import { Client, createClientAsync } from 'soap';

import { ENVIRONMENT_ENUM } from '../enums/index.js';
import { SRI_ENDPOINTS } from '../utils/sri.endpoints.js';


export class ReceptionService {

    async validateXml(env: ENVIRONMENT_ENUM, xml: Buffer): Promise<any> {

        const URL_SRI_WSDL = env == ENVIRONMENT_ENUM.PRUEBAS ?
            SRI_ENDPOINTS['PRUEBAS'].RECEPTION :
            SRI_ENDPOINTS['PRODUCCION'].RECEPTION;


        let result: any;

        try {

            console.log('Validando XML en el SRI...');
            console.log('WSDL URL: ', URL_SRI_WSDL);


            const client: Client = await createClientAsync(URL_SRI_WSDL);

            const xmlBase64 = xml.toString('base64');

            console.log('XML Base64: ', xmlBase64);

            [result] = await client.validarComprobanteAsync({ xml: xmlBase64 });

        } catch (error) {
            console.error('Error al validar el XML en el SRI: ', error);
            throw error;
        }



        const response = result?.RespuestaRecepcionComprobante;

        if (!response) {
            throw new Error(
                "Respuesta inválida del SRI (sin 'respuestaRecepcionComprobante')"
            );
        }

        const comprobante = Array.isArray(response.comprobantes?.comprobante)
            ? response.comprobantes.comprobante[0]
            : response.comprobantes?.comprobante;

        const mensajes = comprobante?.mensajes;
        console.log('Mensajes del SRI: ', mensajes);

        if (mensajes && Array.isArray(mensajes.mensaje)) {
            mensajes?.forEach((msg: any) => {
                console.log(`Mensaje SRI - Identificador: ${msg.identificador}, Mensaje: ${msg.mensaje}, Informacion Adicional: ${msg.informacionAdicional}, tipo: ${msg.tipo}`);
            });
        } else if (mensajes) {
            const msg = mensajes.mensaje;
            console.log(`Mensaje SRI - Identificador: ${msg.identificador}, Mensaje: ${msg.mensaje}, Informacion Adicional: ${msg.informacionAdicional}, tipo: ${msg.tipo}`);
        }


        if (response?.estado === 'RECIBIDA') {
            console.log('XML recibido correctamente por el SRI.');
        } else {
            console.error('Error en la recepción del XML: ', response);
        }

        return response;

    }

}
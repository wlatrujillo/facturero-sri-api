import { Client, createClientAsync } from 'soap';

import { ENVIRONMENT } from '../enums/enviroment.enum.js';
import { SRI_ENDPOINTS } from '../utils/sri.endopoints.js';


export class ReceptionService {



    constructor() {


    }


    async validateXml(env: ENVIRONMENT, xml: string): Promise<any> {

        const URL_SRI_WSDL = env == ENVIRONMENT.PRUEBAS ?
            SRI_ENDPOINTS['PRUEBAS'].RECEPTION :
            SRI_ENDPOINTS['PRODUCCION'].RECEPTION;


        let result: any;

        try {
            const client: Client = await createClientAsync(URL_SRI_WSDL);
            const [result] = await client.validarDocumentoAsync({ xml });

        } catch (error) {
            throw error;
        }

        console.log('Respuesta SRI Recepcion: ', result);

        const response = result?.RespuestaRecepcionComprobante;

        return result;

    }



}
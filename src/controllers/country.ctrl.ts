import type { Request, Response } from 'express';
import { createClientAsync } from 'soap';
import log4js from 'log4js';

const logger = log4js.getLogger("BaseController");

const URL_COUNTRY_WSDL =
    'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL';

class CountryController {

    constructor() {
        logger.info("CountryController initialized");
    }

    getCountryInfo = async (req: Request, res: Response): Promise<void> => {
        try {
            const { sCountryISOCode } = req.params;

            if (!sCountryISOCode) {
                res.status(400).json({ error: 'Country code is required' });
                return;
            }

            const client = await createClientAsync(URL_COUNTRY_WSDL);

            const [result] = await client.CountryNameAsync({ sCountryISOCode });

            const [flagResult ] = await client.CountryFlagAsync({ sCountryISOCode });

            const [capitalResult ] = await client.CapitalCityAsync({ sCountryISOCode });

            const countryinfo = {
                CountryName: result.CountryNameResult,
                CountryFlag: flagResult.CountryFlagResult,
                CapitalCity: capitalResult.CapitalCityResult
            }

            res.status(200).json(countryinfo);

        } catch (error) {
            logger.error('SOAP error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default CountryController;

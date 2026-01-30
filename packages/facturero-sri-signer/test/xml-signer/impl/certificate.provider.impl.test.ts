import { describe, it, mock, beforeEach } from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert';
import { CertificateProviderImpl } from '../../../src/xml-signer/impl/certificate.provider.impl.js';
import { CryptoUtils } from '../../../src/utils/crypto.util.js';
import { SignStrategyFactory } from '../../../src/factories/sign.strategy.factory.js';

describe('CertificateProviderImpl', () => {

    beforeEach(() => {
        // Create mock strategy
    });

    describe('getData', () => {
        it('should successfully extract certificate data from valid P12 buffer', async () => {

            const provider = new CertificateProviderImpl(new SignStrategyFactory(), new CryptoUtils());

            const p12Buffer = fs.readFileSync('./test/resources/certificates/valid_certificate.p12');

            const data = await provider.getData(p12Buffer,"Gocu71421Fir");


            assert.ok(data.certificate);
            assert.ok(data.privateKey);
            assert.ok(data.issuerName);
           
        });

    });

});

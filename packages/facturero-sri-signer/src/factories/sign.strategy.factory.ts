import { UnknownSignStrategyError } from "../exceptions/index.js";
import { SignStrategy } from "../xml-signer/sign.strategy.js";

import { CentralBankStrategy } from "../xml-signer/impl/central.bank.strategy.js";
import { SecurityDataStrategy } from "../xml-signer/impl/security.data.strategy.js";
import { UanatacaStrategy } from "../xml-signer/impl/uanataca.strategy.js";


export class SignStrategyFactory {
    private readonly strategies: SignStrategy[] = [
        new CentralBankStrategy(),
        new SecurityDataStrategy(),
        new UanatacaStrategy(),
    ];

    getStrategy(friendlyName: string): SignStrategy {
        const strategy = this.strategies.find((s) => s.supports(friendlyName));
        if (!strategy) {
            throw new UnknownSignStrategyError(friendlyName);
        }
        return strategy;
    }
}
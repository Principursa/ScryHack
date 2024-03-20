import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const BettingModule = buildModule('Betting', (bettingContract) => {
    const betting = bettingContract.contract(
        'Betting',
        [
            // need to pass oracle address here
        ],
        {
            // value: oracleAddress
        }
    );
    // const betting = bettingContract.contract('Betting', [oracleAddress], { value: oracleAddress });

    return { betting };
});

export default BettingModule;

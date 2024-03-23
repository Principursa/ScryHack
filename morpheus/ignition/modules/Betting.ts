import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const BettingModule = buildModule('Betting', (m) => {
    // const oracleAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    const betting = m.contract('Betting', [], {
        // value: oracleAddress,
    });
    // const betting = bettingContract.contract('Betting', [oracleAddress], { value: oracleAddress });

    return { betting };
});

export default BettingModule;

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const BettingModule = buildModule('Betting', (bettingContract) => {
    /// load from env

    const oracleAddress = bettingContract.getParameter('oracleAddress', process.env.ORACLE_ADDRESS);

    const betting = bettingContract.contract('Betting', [], {});
    // const betting = bettingContract.contract('Betting', [oracleAddress], { value: oracleAddress });

    return { betting };
});

export default BettingModule;

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MocksModule = buildModule('NostradamusSS', (MocksContract) => {
    /// load from env

    const oracleAddress = MocksContract.getParameter('oracleAddress', process.env.ORACLE_ADDRESS);

    const mocks = MocksContract.contract('NostradamusSS', [], {});
    // const Mocks = MocksContract.contract('Mocks', [oracleAddress], { value: oracleAddress });

    return { mocks };
});

export default MocksModule;

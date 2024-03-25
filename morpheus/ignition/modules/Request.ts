import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const RequestModule = buildModule('Request', (m) => {
    const request = m.contract('Request', ['0x0000000000071821e8033345A7Be174647bE0706'], {});

    return { request };
});

export default RequestModule;

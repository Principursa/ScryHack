import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'hardhat';

const BettingModule = buildModule('Betting', (m) => {
    const betting = m.contract('Betting', ['0x0000000000071821e8033345A7Be174647bE0706'], {});

    return { betting };
});

export default BettingModule;

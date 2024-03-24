import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'hardhat';

const BettingModule = buildModule('Betting', (m) => {
    m.contractAt('MockMorpheus', '0x5FbDB2315678afecb367f032d93F642f64180aa3');

    const betting = m.contract('Betting', ['0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'], {});

    return { betting };
});

export default BettingModule;

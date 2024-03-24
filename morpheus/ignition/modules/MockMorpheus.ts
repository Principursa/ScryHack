import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { network } from 'hardhat';

const MockMorpheus = buildModule('MockMorpheus', (m) => {
    console.log(network.name);
    console.log('Deploying MockMorpheus');
    const mockMorpheus = m.contract('MockMorpheus', [], {});

    return { mockMorpheus };
});

export default MockMorpheus;

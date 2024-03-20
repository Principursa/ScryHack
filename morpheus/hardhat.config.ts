import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
require('dotenv').config();

const config: HardhatUserConfig = {
    solidity: '0.8.24',
    defaultNetwork: 'hardhat',
    sourcify: {
        enabled: true,
    },
    networks: {
        hardhat: {
            chainId: 1337,
        },
        sepolia: {
            chainId: 11155111,
            url: 'https://rpc.sepolia.org',
            accounts: [process.env.PRIVATE_KEY as string],
        },
    },
};

export default config;

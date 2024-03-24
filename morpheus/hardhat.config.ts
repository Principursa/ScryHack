import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition-ethers';
import '@nomicfoundation/hardhat-ethers';

// require('./task.js');
require('dotenv').config();

const config: HardhatUserConfig = {
    solidity: '0.8.20',
    defaultNetwork: 'hardhat',
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
        enabled: true,
    },
    sourcify: {
        enabled: true,
    },
    networks: {
        hardhat: {
            chainId: 1337,
        },
        truffle: {
            chainId: 1337,
            url: 'http://127.0.0.1:7545',
            accounts: ['0x731ac1f58e6acf2ba1cdc21c114fc4f7730db111b17760f11756e945575d5a8f'],
        },
        sepolia: {
            chainId: 11155111,
            url: 'https://rpc.sepolia.org',
            accounts: [process.env.PRIVATE_KEY as string],
        },
    },
};

export default config;

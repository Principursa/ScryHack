import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'


import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const config = getDefaultConfig({
  appName: "SPScry",
  projectId: 'b17dfb75dcaf111070742d4a6cbf0c5b',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
})
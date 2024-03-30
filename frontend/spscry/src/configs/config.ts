import { http, createConfig } from 'wagmi'
import { mainnet, sepolia,holesky } from 'wagmi/chains'


import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const config = getDefaultConfig({
  appName: "SPScry",
  projectId: 'b17dfb75dcaf111070742d4a6cbf0c5b',
  chains: [sepolia,holesky],
  transports: {
    [sepolia.id]: http(),
    [holesky.id]: http(),
  },
})
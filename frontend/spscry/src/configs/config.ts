import { http } from 'wagmi'
import {holesky } from 'wagmi/chains'


import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const config = getDefaultConfig({
  appName: "ScryBall",
  projectId: '956230dd841f3d0991c1f6efe7b4410b',
  chains: [holesky],
  transports: {
    [holesky.id]: http(),
  },
})
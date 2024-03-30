import { defineConfig } from '@wagmi/cli'
import Betting from './artifacts/contracts/Betting.sol/Betting.json'
import Morpheus from "./artifacts/contracts/Betting.sol/Morpheus.json"
import { hardhat } from '@wagmi/cli/plugins'


export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name : "MyMorpheus",
      abi: Morpheus["abi"]
    },
    {
      name: 'MyBetting',
      abi: Betting["abi"]
    },


  ],
  plugins: [
    hardhat({
      project: '../morpheus',
      artifacts: 'artifacts'

    }),
  ],
})

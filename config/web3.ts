import { Chain, ChainProviderFn, configureChains, createConfig } from 'wagmi'
import { mainnet, goerli, localhost, hardhat } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { infuraProvider } from 'wagmi/providers/infura'
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { ALCHEMY_API_KEY, CHAIN_NAME, INFURA_API_KEY, WC_PROJECT_ID } from "@/config/constants";

// const {chains, publicClient, webSocketPublicClient} = configureChains(
//   [goerli],
//   [publicProvider()],
// )

const chain = () => {
  switch (CHAIN_NAME) {
    case 'goerli':
      return goerli
    case 'localhost':
      return localhost
    case 'hardhat':
      return hardhat
    default:
      return mainnet
  }
}

const providers = () => {
  const providers: ChainProviderFn<Chain>[] = []
  if (INFURA_API_KEY !== undefined && INFURA_API_KEY !== '') {
    providers.push(infuraProvider({apiKey: INFURA_API_KEY}))
  }
  if (ALCHEMY_API_KEY !== undefined && ALCHEMY_API_KEY !== '') {
    providers.push(alchemyProvider({apiKey: ALCHEMY_API_KEY}))
  }
  providers.push(publicProvider())
  return providers
}

const {chains, publicClient, webSocketPublicClient} = configureChains(
  [chain()],
  // @ts-ignore
  providers(),
)


const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: WC_PROJECT_ID,
  chains
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})


export const wagmiChains = chains

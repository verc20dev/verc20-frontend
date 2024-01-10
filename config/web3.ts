import { configureChains, createConfig } from 'wagmi'
import { mainnet, goerli, localhost, hardhat } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { WC_PROJECT_ID } from "@/config/constants";

// const {chains, publicClient, webSocketPublicClient} = configureChains(
//   [goerli],
//   [publicProvider()],
// )

const {chains, publicClient, webSocketPublicClient} = configureChains(
  [hardhat],
  [publicProvider()],
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

"use client";

import { NextUIProvider } from '@nextui-org/react'

import { wagmiChains, wagmiConfig } from "@/config/web3";
import { WagmiConfig } from "wagmi";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { SnackbarProvider } from "notistack";
import { ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({children, themeProps}: ProvidersProps) {
  return (
    <NextUIProvider>
      <NextThemesProvider {...themeProps}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={wagmiChains} theme={darkTheme()} modalSize="compact">
              {children}
            </RainbowKitProvider>
          </WagmiConfig>
        </SnackbarProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
}
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { Button } from "@nextui-org/button";
import { CopyIcon, DisconnectIcon, DropDownIcon, WalletIcon } from "@/components/icons";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import { useDisconnect } from "wagmi";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";


export const CustomConnectBtn = () => {
    const {disconnect} = useDisconnect();
    const router = useRouter();

    return (
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');
          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button onPress={openConnectModal} color="primary" className="font-bold">
                      Connect
                    </Button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <Button onPress={openChainModal} color="danger" className="font-bold">
                      Wrong network
                    </Button>
                  );
                }
                return (
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        className="font-bold"
                        endContent={<DropDownIcon/>}
                        startContent={chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <Image
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                width={12}
                                height={12}
                              />
                            )}
                          </div>
                        )}
                      >
                        {account.displayName}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                      <DropdownItem
                        key="balance"
                        startContent={<WalletIcon/>}
                        onPress={() => {router.push(`/address/${account.address}`)}}
                      >
                        My Balance</DropdownItem>
                      <DropdownItem
                        key="copy"
                        className="text-inherit"
                        startContent={<CopyIcon/>}
                        onPress={() => {
                          navigator.clipboard.writeText(account.address)
                            .then(_ => enqueueSnackbar('Copied to clipboard', { variant: 'success' }));
                        }}
                      >
                        Copy Address
                      </DropdownItem>
                      <DropdownItem key="delete" className="text-danger" color="danger"
                                    onPress={() => disconnect()}
                                    startContent={<DisconnectIcon/>}>
                        Disconnect
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    )
  }
;


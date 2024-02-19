import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, Select, SelectItem, Switch, Tab, Tabs } from "@nextui-org/react";
import { ModalHeader } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { CloseIcon } from "@nextui-org/shared-icons";
import useSWR, { useSWRConfig } from "swr";
import {
  API_ENDPOINT,
  ETH_PRICE_ENDPOINT, LIQUIDITY_REWARD_RATE,
  MARKET_CONTRACT_ADDRESS,
  MARKET_CONTRACT_DOMAIN,
  MARKET_CONTRACT_ORDER_TYPES, PROTOCOL_FEE_RATE
} from "@/config/constants";
import useSWRMutation from "swr/mutation";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { useEthersSigner } from "@/hook/ethers";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { formListInput } from "@/utils/tx-message";
import { getBigInt } from "ethers";
import { formatEther, parseEther } from "viem";
import { Spinner } from "@nextui-org/spinner";
import { Int } from "@solana/buffer-layout";


export interface CreateOrderModalProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  tokenName: string;
}

const CreateOrderModal: FC<CreateOrderModalProps> = ({
  isOpen,
  onOpenChange,
  tokenName
}: CreateOrderModalProps) => {

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const [canClose, setCanClose] = React.useState<boolean>(true);
  useEffect(() => {
    if (!canClose && isOpen) {
      window.addEventListener("beforeunload", alertUser);
      return () => {
        window.removeEventListener("beforeunload", alertUser);
      };
    }
  }, [canClose, isOpen]);
  const alertUser = (e: any) => {
    e.preventDefault();
    e.returnValue = "";
  };

  const [amount, setAmount] = React.useState<string>("");
  const [isAmountInvalid, setIsAmountInvalid] = React.useState<boolean>(false);
  const [amountErrorText, setAmountErrorText] = React.useState<string>("");

  const [unitPrice, setUnitPrice] = React.useState<string>("");
  const [isUnitPriceInvalid, setIsUnitPriceInvalid] = React.useState<boolean>(false);
  const [unitPriceErrorText, setUnitPriceErrorText] = React.useState<string>("");

  const [confirming, setConfirming] = React.useState<boolean>(false);
  const [confirmingText, setConfirmingText] = React.useState<string>("Confirming...");

  const [durationSelected, setDurationSelected] = React.useState<string>("7D");
  const [orderType, setOrderType] = React.useState<string>("ask");

  const {data: ethPrice, error: ethPriceError} = useSWR(ETH_PRICE_ENDPOINT, fetcher, {refreshInterval: 20000});
  const {address, isConnected, isDisconnected} = useAccount();
  const signer = useEthersSigner();
  const {chain} = useNetwork()

  const {
    data: ethBalance,
    isError: ethBalanceIsError,
    isLoading: ethBalanceIsLoading
  } = useBalance({
    address: address,
  })


  const userBalanceUrl = `${API_ENDPOINT}/holders/${address}?tick=${tokenName}`
  const {data: userBalanceData, error: userBalanceError} = useSWR(userBalanceUrl, fetcher, {refreshInterval: 20000});

  const marketTokenDetailEp = `${API_ENDPOINT}/market/tokens/${tokenName}`
  const {
    data: marketTokenDetailData,
    error: marketTokenDetailError
  } = useSWR(marketTokenDetailEp, fetcher, {refreshInterval: 20000});

  const {mutate} = useSWRConfig()
  const ordersEpStart = `${API_ENDPOINT}/market/orders`

  const userTokenBalance = useMemo(() => {
    if (userBalanceData?.tokens?.length > 0) {
      return userBalanceData.tokens[0].balance;
    }
    return "0";
  }, [userBalanceData])

  const userEthBalance = useMemo(() => {
    return Number(ethBalance?.formatted)
  }, [ethBalance])

  const userEthBalanceStr = useMemo(() => {
    const balanceString = ethBalance?.formatted
    return new Intl.NumberFormat(
      'en-US',
      {
        maximumFractionDigits: 4
      }
    ).format(Number(balanceString))
  }, [ethBalance])

  const floorPrice = useMemo(() => {
    if (marketTokenDetailData !== undefined) {
      return marketTokenDetailData.floorPrice;
    }
  }, [marketTokenDetailData])


  const getEstimateUnitPrice = (unitPrice: string, ethPrice: string) => {
    return new Intl.NumberFormat('en-US').format(Number(unitPrice) * Number(ethPrice))
  }

  const getEstimateTotalPrice = (amount: any, unitPrice: string, ethPrice: string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount) * Number(unitPrice) * Number(ethPrice))
  }

  const getEstimateTotalInEth = (amount: any, unitPrice: string) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 10
    }).format(Number(amount) * Number(unitPrice))
  }

  const getEstimateTotalInUsd = (amount: any, unitPrice: string, ethPrice: string) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 10
    }).format(Number(amount) * Number(unitPrice) * Number(ethPrice))
  }

  // const getEstimateRevenueInEth = (amount: string, unitPrice: string) => {
  //   return new Intl.NumberFormat('en-US').format(Number(amount) * Number(unitPrice) * 0.98)
  // }
  //
  // const getEstimateRevenueInUsd = (amount: string, unitPrice: string, ethPrice: string) => {
  //   return new Intl.NumberFormat('en-US').format(Number(amount) * Number(unitPrice) * 0.98 * Number(ethPrice))
  // }

  const onAmountChange = useCallback((value: string) => {
    setAmount(value);

    // check if amount NaN
    if (Number.isNaN(Number(value))) {
      setIsAmountInvalid(true);
      setAmountErrorText("Amount must be a number");
      return;
    }

    // check if amount > 0
    if (Number(value) <= 0) {
      setIsAmountInvalid(true);
      setAmountErrorText("Amount must be greater than 0");
      return;
    }

    // bid order have no amount limit, but need to check if amount * unit price > user eth balance
    if (orderType === "bid") {
      if (Number(value) * Number(unitPrice) > Number(userEthBalance)) {
        setIsAmountInvalid(true);
        setAmountErrorText("Total price must be less than or equal to your max eth balance");
        return;
      }

      setIsAmountInvalid(false);
      setAmountErrorText("");
      return;
    }

    let maxAmount = "0";
    if (userBalanceData?.tokens?.length > 0) {
      maxAmount = userBalanceData.tokens[0].balance;
    }


    if (Number(value) > Number(maxAmount)) {
      setIsAmountInvalid(true);
      setAmountErrorText("Amount must be less than or equal to your max token balance");
    } else {
      setIsAmountInvalid(false);
      setAmountErrorText("");
    }
  }, [userBalanceData, orderType, unitPrice, userEthBalance])

  const onUnitPriceChange = useCallback((value: string) => {
    setUnitPrice(value);

    // check if unit price NaN
    if (Number.isNaN(Number(value))) {
      setIsUnitPriceInvalid(true);
      setUnitPriceErrorText("Unit price must be a number");
      return
    }
    if (Number(value) <= 0) {
      setIsUnitPriceInvalid(true);
      setUnitPriceErrorText("Unit price must be greater than 0");
      return;
    }

    if (orderType === 'bid') {
      // check if unit price > user eth balance
      if (Number(value) > Number(userEthBalance)) {
        setIsUnitPriceInvalid(true);
        setUnitPriceErrorText("Unit price must be less than or equal to your max eth balance");
        return;
      }

      // check if unit price * amount > user eth balance
      if (Number(value) * Number(amount) > Number(userEthBalance)) {
        setIsUnitPriceInvalid(true);
        setUnitPriceErrorText("Total price must be less than or equal to your max eth balance");
        return;
      }
    }

    setIsUnitPriceInvalid(false);
    setUnitPriceErrorText("");
  }, [orderType, userEthBalance, amount])

  const liquidityRewardAmount = useMemo(() => {
    return Number(amount) * LIQUIDITY_REWARD_RATE;
  }, [amount])

  const revenueAmount = useMemo(() => {
    return Number(amount) + liquidityRewardAmount
  }, [amount, liquidityRewardAmount])


  const amountInputEndContent = useMemo(() => {
    let maxAmount = "0";
    if (userBalanceData?.tokens?.length > 0) {
      maxAmount = userBalanceData.tokens[0].balance;
    }

    return <div className="flex flex-row gap-2">
      <Button size="sm" onPress={() => onAmountChange("")} isIconOnly radius="md">
        <CloseIcon/>
      </Button>
      {orderType === "ask" &&
        <Button size="sm" color="primary" onPress={() => onAmountChange(maxAmount)}>
          <p className="font-bold">Max</p>
        </Button>
      }
    </div>
  }, [userBalanceData, orderType, onAmountChange]);

  const unitPriceInputEndContent = useMemo(() => {
    return (
      <div className="flex flex-row gap-2">
        <div className="flex flex-row items-center">
          <p className={"text-gray-400 "}>ETH</p>
        </div>
        <div className="flex flex-row items-center">
          <p
            className="text-gray-400 inline">≈&nbsp;${getEstimateUnitPrice(unitPrice, ethPrice?.data?.amount)}</p>
        </div>
        <Button size="sm" onPress={() => onUnitPriceChange("")} isIconOnly radius="md">
          <CloseIcon/>
        </Button>
        <Button size="sm" color="primary" onPress={() => onUnitPriceChange(formatEther(getBigInt(floorPrice)))}>
          <p className="font-bold">Auto</p>
        </Button>
      </div>
    )
  }, [ethPrice, floorPrice, unitPrice, onUnitPriceChange]);

  const summarySection = useMemo(() => {
    return (
      <div className="flex flex-col gap-2 mt-4 rounded-md p-4 border-default border-2">
        <div className="mt-2">
          <p className="font-mono text-lg">Summary:</p>
        </div>
        {orderType === "bid" &&
          <div>
            <p className="font-mono text-medium mt-2">You will pay:</p>
          </div>
        }
        <div className="flex justify-between items-start font-mono text-medium text-default-500">
          <p>Order Value:</p>
          <p>{getEstimateTotalInEth(amount, unitPrice)}&nbsp;ETH&nbsp;≈&nbsp;${getEstimateTotalInUsd(amount, unitPrice, ethPrice?.data?.amount)}</p>
        </div>
        {orderType === "bid" &&
          <div>
            <p className="font-mono text-medium mt-2">You will get:</p>
          </div>
        }

        <div className="flex justify-between items-start font-mono text-medium text-default-500">
          <p>Liquidity Reward:</p>
          <p>{getEstimateTotalInEth(
            liquidityRewardAmount,
            unitPrice)}&nbsp;ETH&nbsp;≈&nbsp;${getEstimateTotalPrice(
            liquidityRewardAmount, unitPrice, ethPrice?.data?.amount)}</p>
        </div>

        {orderType === "bid" &&
          <div className="flex justify-between items-start font-mono text-medium text-default-500">
            <p>Receive Token:</p>
            <p>{amount}&nbsp;{tokenName}</p>
          </div>
        }
        {orderType === "ask" &&
          <div className="flex justify-between items-start font-mono text-medium text-default-500">
            <p>Total Revenue:</p>
            <p>{getEstimateTotalInEth(revenueAmount, unitPrice)}&nbsp;ETH&nbsp;≈&nbsp;${getEstimateTotalInUsd(revenueAmount, unitPrice, ethPrice?.data?.amount)}</p>
          </div>
        }
      </div>
    )
  }, [orderType, amount, unitPrice, ethPrice, liquidityRewardAmount, tokenName, revenueAmount])

  const isConfirmDisabled = useMemo(() => {
    return isAmountInvalid || isUnitPriceInvalid || amount === "" || unitPrice === "" || Number(amount) <= 0 || Number(unitPrice) <= 0;
  }, [amount, isAmountInvalid, isUnitPriceInvalid, unitPrice]);

  const onConfirm = useCallback(() => {
    // 1. send eth transaction
    // 2. create order
    if (!isConnected || isDisconnected) {
      enqueueSnackbar('Please connect wallet first', {variant: 'error'})
      return;
    }

    if (!signer) {
      enqueueSnackbar('Please connect wallet first', {variant: 'error'})
      return;
    }

    if (isConfirmDisabled) {
      enqueueSnackbar('Please check your input and try again.', {variant: 'error'})
      return;
    }

    setConfirming(true);
    setCanClose(false);

    const transferData = formListInput({
      tick: tokenName,
      amount: amount,
    });

    let value = parseEther("0.0");
    if (orderType === "bid") {
      value = parseEther(getEstimateTotalInEth(amount, unitPrice));
    }

    const tx = {
      to: MARKET_CONTRACT_ADDRESS,
      value: value,
      data: transferData,
      // gasLimit: 200000,
    }

    // if (orderType === "bid") {
    //   tx.gasLimit = 200000
    //   tx.gasPrice = parseEther("0.00000002")
    // }

    signer.sendTransaction(tx)
      .then((tx) => {
        enqueueSnackbar('List Tx successfully sent', {variant: 'success'})
        setConfirmingText("Waiting for confirmation...")
        tx.wait()
          .then((receipt) => {
            enqueueSnackbar('List Tx successfully mined', {variant: 'success'})
            const domain = {
              ...MARKET_CONTRACT_DOMAIN,
              chainId: chain?.id,
            }
            const nowInSeconds = Math.round(Date.now() / 1000);
            let days = 7
            switch (durationSelected) {
              case "7D":
                days = 7;
                break;
              case "14D":
                days = 14;
                break;
              case "1M":
                days = 30;
                break
              default:
                days = 7;
            }
            const durationInSeconds = 60 * 60 * 24 * days;
            const order = {
              maker: address,
              sell: orderType === "ask",
              listId: tx.hash,
              tick: tokenName,
              amount: getBigInt(amount).toString(),
              price: parseEther(unitPrice).toString(),
              listingTime: nowInSeconds,
              expirationTime: nowInSeconds + durationInSeconds,
            }

            setConfirmingText("Signing order...")
            signer.signTypedData(domain, MARKET_CONTRACT_ORDER_TYPES, order)
              .then((signature) => {
                const data: any = {
                  tick: tokenName,
                  owner: address,
                  quantity: amount,
                  unit_price: parseEther(unitPrice).toString(),
                  tx: tx.hash,
                  creation_time: nowInSeconds,
                  expiration_time: nowInSeconds + durationInSeconds,
                  signature: signature,
                  input: JSON.stringify(order),
                  sell: order.sell
                }

                fetch(`${API_ENDPOINT}/market/orders`, {
                  method: 'POST',
                  body: JSON.stringify(data)
                })
                  .then(() => {
                    enqueueSnackbar('List successfully created', {variant: 'success'})
                    setConfirming(false);
                    onOpenChange && onOpenChange(false);

                    // refetch orders
                    mutate(
                      key => typeof key === 'string' && key.startsWith(ordersEpStart),
                    )

                  })
                  .catch((err) => {
                    // notice: this will not suppose to happen
                    console.log(err)
                    enqueueSnackbar('List failed', {variant: 'error'})
                  })

              })
              .catch((err) => {
                console.log(err)
                if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
                  enqueueSnackbar('List Sign cancelled', {variant: 'warning'})
                } else {
                  enqueueSnackbar(`List Sign failed. Reason: ${err.code}`, {variant: 'error'})
                }

              })
              .finally(() => {
                setConfirmingText("Confirming...")
                setConfirming(false);
                setCanClose(true);
              })

          })
          .catch((err) => {
            console.log(err)
            enqueueSnackbar(`List Tx failed. Reason: ${err.code}`, {
              variant: 'error',
              persist: true,
              action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
            })
          })
      })
      .catch((err) => {
        if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
          enqueueSnackbar('List cancelled', {variant: 'warning'})
        } else {
          console.log(err)
          enqueueSnackbar(`List failed. Reason: ${err.code}`, {
            variant: 'error',
            persist: true,
            action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
          })
        }
        setConfirmingText("Confirming...")
        setConfirming(false);
      })
      .finally(() => {
        // setConfirmingText("Confirming...")
        // setConfirming(false);
        // onOpenChange && onOpenChange(false);
      })

  }, [
    isConnected, isDisconnected, signer, isConfirmDisabled, tokenName,
    amount, chain, durationSelected, address, unitPrice, onOpenChange,
    mutate, ordersEpStart, orderType
  ]);

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={canClose}
        isKeyboardDismissDisabled={canClose}
        hideCloseButton={!canClose}
        backdrop="blur"
        size="lg"
        scrollBehavior={"outside"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-bold text-center">
                Create Order
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col sm:gap-4 sm:mt-4">
                  <div className="flex flex-col sm:gap-4 gap-2 rounded-md sm:p-4 p-2 border-default border-2">
                    <div className="flex flex-row justify-between items-center font-mono">
                      <p>Order Type:</p>
                      <Tabs
                        isDisabled={confirming}
                        key={"success"}
                        color={"success"}
                        size="md"
                        selectedKey={orderType}
                        onSelectionChange={(selection) => {
                          setOrderType(selection.toString())
                          onAmountChange("")
                        }}
                        className={"font-mono font-bold"}
                      >
                        <Tab key={"ask"} title="Ask"/>
                        <Tab key={"bid"} title="Bid"/>
                      </Tabs>
                    </div>
                    {floorPrice !== undefined && floorPrice !== "" &&
                      <div className="flex justify-between items-start font-mono">
                        Floor: <span
                        className="font-bold">{formatEther(getBigInt(floorPrice))}&nbsp;ETH&nbsp;≈&nbsp;${getEstimateUnitPrice(formatEther(getBigInt(floorPrice)), ethPrice?.data?.amount)}</span>
                      </div>
                    }
                    {orderType === "ask" ?
                      <div className="flex justify-between items-start font-mono">
                        Balance: <span className="font-bold">{userTokenBalance}&nbsp;{tokenName}</span>
                      </div>
                      :
                      <div className="flex justify-between items-start font-mono">
                        Balance: <span className="font-bold">{userEthBalanceStr}&nbsp;ETH</span>
                      </div>
                    }
                    <div className="flex justify-between items-start font-mono">
                      <p>Liquidity Reward Rate:</p>
                      <p>{new Intl.NumberFormat('en-US', {
                        style: 'percent',
                        maximumFractionDigits: 2
                      }).format(LIQUIDITY_REWARD_RATE)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mt-2 sm:mt-0">
                    <Input
                      isDisabled={confirming}
                      label="Amount"
                      labelPlacement={"outside"}
                      placeholder=""
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      isRequired
                      value={amount}
                      onValueChange={onAmountChange}
                      isInvalid={isAmountInvalid}
                      errorMessage={amountErrorText}
                      endContent={amountInputEndContent}
                    />
                  </div>
                  <div className="flex justify-between items-start mt-2 sm:mt-0">
                    <Input
                      isDisabled={confirming}
                      label="Unit Price"
                      labelPlacement={"outside"}
                      placeholder=""
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      isRequired
                      value={unitPrice}
                      onValueChange={onUnitPriceChange}
                      isInvalid={isUnitPriceInvalid}
                      errorMessage={unitPriceErrorText}
                      endContent={unitPriceInputEndContent}
                    />
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0">
                    <Select
                      isDisabled={confirming}
                      labelPlacement={"outside"}
                      label="Expires&nbsp;in"
                      defaultSelectedKeys={["7D"]}
                      isRequired
                      size={"lg"}
                      classNames={{
                        label: "font-mono text-foreground-500 text-ellipsis text-[16px]",
                        mainWrapper: "font-mono text-[16px]",
                        listbox: "font-mono text-[16px]"
                      }}
                      selectedKeys={[durationSelected]}
                      onSelectionChange={(selection: any) => {
                        setDurationSelected(selection[0])
                      }}
                    >
                      <SelectItem key="7D" value={""}>
                        7 Days
                      </SelectItem>
                      <SelectItem key="14D" value={""}>
                        14 Days
                      </SelectItem>
                      <SelectItem key="1M" value={""}>
                        1 Month
                      </SelectItem>
                    </Select>
                  </div>
                  {summarySection}
                </div>
              </ModalBody>
              <ModalFooter>
                {confirming ?
                  <>
                    <Button color="primary" isDisabled={true} startContent={<Spinner color={"white"}/>}>
                      {confirmingText}
                    </Button>
                  </>
                  :
                  <>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" isDisabled={isConfirmDisabled} onPress={onConfirm}>
                      Confirm
                    </Button>
                  </>
                }
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default CreateOrderModal;
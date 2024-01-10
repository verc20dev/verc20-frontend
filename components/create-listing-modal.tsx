import React, { FC, useCallback, useMemo } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, Select, SelectItem, Switch } from "@nextui-org/react";
import { ModalHeader } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { CloseIcon } from "@nextui-org/shared-icons";
import useSWR, { useSWRConfig } from "swr";
import {
  API_ENDPOINT,
  ETH_PRICE_ENDPOINT,
  MARKET_CONTRACT_ADDRESS,
  MARKET_CONTRACT_DOMAIN,
  MARKET_CONTRACT_ORDER_TYPES
} from "@/config/constants";
import useSWRMutation from "swr/mutation";
import { useAccount, useNetwork } from "wagmi";
import { useEthersSigner } from "@/hook/ethers";
import { enqueueSnackbar } from "notistack";
import { formListInput } from "@/utils/tx-message";
import { getBigInt } from "ethers";
import { formatEther, parseEther } from "viem";
import { Spinner } from "@nextui-org/spinner";


export interface CreateListingModalProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  tokenName: string;
}

async function createOrder(url: string, {arg}: { arg: any }) {
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg)
  })
}


const CreateListingModal: FC<CreateListingModalProps> = ({
  isOpen,
  onOpenChange,
  tokenName
}: CreateListingModalProps) => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const [amount, setAmount] = React.useState<string>("");
  const [isAmountInvalid, setIsAmountInvalid] = React.useState<boolean>(false);
  const [amountErrorText, setAmountErrorText] = React.useState<string>("");

  const [unitPrice, setUnitPrice] = React.useState<string>("");
  const [isUnitPriceInvalid, setIsUnitPriceInvalid] = React.useState<boolean>(false);
  const [unitPriceErrorText, setUnitPriceErrorText] = React.useState<string>("");

  const [confirming, setConfirming] = React.useState<boolean>(false);
  const [confirmingText, setConfirmingText] = React.useState<string>("Confirming...");

  const [durationSelected, setDurationSelected] = React.useState<string>("7D");

  const {data: ethPrice, error: ethPriceError} = useSWR(ETH_PRICE_ENDPOINT, fetcher, {refreshInterval: 20000});
  const {address, isConnected, isDisconnected} = useAccount();
  const signer = useEthersSigner();
  const {chain} = useNetwork()


  // const createOrderUrl = `${API_ENDPOINT}/market/orders`
  // const {trigger: createOrderTrigger} = useSWRMutation(
  //   createOrderUrl, createOrder, {throwOnError: false});

  const userBalanceUrl = `${API_ENDPOINT}/holders/${address}?tick=${tokenName}`
  const {data: userBalanceData, error: userBalanceError} = useSWR(userBalanceUrl, fetcher, {refreshInterval: 20000});

  const marketTokenDetailEp = `${API_ENDPOINT}/market/tokens/${tokenName}`
  const {
    data: marketTokenDetailData,
    error: marketTokenDetailError
  } = useSWR(marketTokenDetailEp, fetcher, {refreshInterval: 20000});

  const { mutate } = useSWRConfig()
  const ordersEpStart = `${API_ENDPOINT}/market/orders`

  const userBalance = useMemo(() => {
    if (userBalanceData?.tokens?.length > 0) {
      return userBalanceData.tokens[0].balance;
    }
    return "0";
  }, [userBalanceData])

  const floorPrice = useMemo(() => {
    if (marketTokenDetailData !== undefined) {
      return marketTokenDetailData.floorPrice;
    }
  }, [marketTokenDetailData])


  const getEstimateUnitPrice = (unitPrice: string, ethPrice: string) => {
    return new Intl.NumberFormat('en-US').format(Number(unitPrice) * Number(ethPrice))
  }

  const getEstimateTotalPrice = (amount: string, unitPrice: string, ethPrice: string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount) * Number(unitPrice) * Number(ethPrice))
  }

  const getEstimateTotalInEth = (amount: string, unitPrice: string) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 10
    }).format(Number(amount) * Number(unitPrice))
  }

  const getEstimateRevenueInEth = (amount: string, unitPrice: string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount) * Number(unitPrice) * 0.98)
  }

  const getEstimateRevenueInUsd = (amount: string, unitPrice: string, ethPrice: string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount) * Number(unitPrice) * 0.98 * Number(ethPrice))
  }

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
  }, [userBalanceData])

  const onUnitPriceChange = useCallback((value: string) => {
    setUnitPrice(value);

    // check if unit price NaN
    if (Number.isNaN(Number(value))) {
      setIsUnitPriceInvalid(true);
      setUnitPriceErrorText("Unit price must be a number");
    }
    if (Number(value) <= 0) {
      setIsUnitPriceInvalid(true);
      setUnitPriceErrorText("Unit price must be greater than 0");
    }

    setIsUnitPriceInvalid(false);
    setUnitPriceErrorText("");
  }, [])


  const amountInputEndContent = useMemo(() => {
    let maxAmount = "0";
    if (userBalanceData?.tokens?.length > 0) {
      maxAmount = userBalanceData.tokens[0].balance;
    }

    return <div className="flex flex-row gap-2">
      <Button size="sm" onPress={() => setAmount("")} isIconOnly radius="md">
        <CloseIcon/>
      </Button>
      <Button size="sm" color="primary" onPress={() => setAmount(maxAmount)}>
        <p className="font-bold">Max</p>
      </Button>
    </div>
  }, [userBalanceData]);

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
        <Button size="sm" onPress={() => setUnitPrice("")} isIconOnly radius="md">
          <CloseIcon/>
        </Button>
        <Button size="sm" color="primary" onPress={() => setUnitPrice(formatEther(getBigInt(floorPrice)))}>
          <p className="font-bold">Auto</p>
        </Button>
      </div>
    )
  }, [ethPrice, floorPrice, unitPrice]);

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

    const transferData = formListInput({
      tick: tokenName,
      amount: amount,
    });

    const tx = {
      to: MARKET_CONTRACT_ADDRESS,
      value: parseEther("0.0"),
      data: transferData,
    }

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
              seller: address,
              listId: tx.hash,
              tick: tokenName,
              amount: getBigInt(amount).toString(),
              price: parseEther(unitPrice).toString(),
              listingTime: nowInSeconds,
              expirationTime: nowInSeconds + durationInSeconds,
            }

            console.log(order)

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
                  input: JSON.stringify(order)
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
                    console.log(err)
                    enqueueSnackbar('List failed', {variant: 'error'})
                  })

              })
              .catch((err) => {
                console.log(err)
                if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
                  enqueueSnackbar('List Sign cancelled', {variant: 'warning'})
                } else {
                  enqueueSnackbar('List Sign failed', {variant: 'error'})
                }

              })
              .finally(() => {
                setConfirmingText("Confirming...")
                setConfirming(false);
              })

          })
          .catch((err) => {
            console.log(err)
            enqueueSnackbar('List sign failed', {variant: 'error'})
          })
      })
      .catch((err) => {
        if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
          enqueueSnackbar('List cancelled', {variant: 'warning'})
        } else {
          console.log(err)
          enqueueSnackbar('List failed', {variant: 'error'})
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
    mutate, ordersEpStart
  ]);

  return (
    <div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-bold text-center">Listing {tokenName}</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4 mt-4">
                  {floorPrice !== undefined && floorPrice !== "" &&
                    <div className="flex justify-between items-start font-mono">
                      Floor: <span
                      className="font-bold">{formatEther(getBigInt(floorPrice))}&nbsp;ETH&nbsp;≈&nbsp;${getEstimateUnitPrice(formatEther(getBigInt(floorPrice)), ethPrice?.data?.amount)}</span>
                    </div>
                  }
                  <div className="flex justify-between items-start font-mono">
                    Balance: <span className="font-bold">{userBalance}&nbsp;{tokenName}</span>
                  </div>


                  <div className="flex justify-between items-start">
                    <Input
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
                  <div className="flex justify-between items-start">
                    <Input
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
                  <div className="flex items-center">
                    <Select
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
                  <div className="flex justify-between items-start font-mono text-medium text-default-500 mt-4">
                    <p>Total Price:</p>
                    <p>{getEstimateTotalInEth(amount, unitPrice)}&nbsp;ETH&nbsp;≈&nbsp;${getEstimateTotalPrice(amount, unitPrice, ethPrice?.data?.amount)}</p>
                  </div>
                  <div className="flex justify-between items-start font-mono text-medium text-default-500">
                    <p>Service Fee:</p>
                    <p>2%</p>
                  </div>
                  <div className="flex justify-between items-start font-mono text-medium text-default-500">
                    <p>Total Revenue:</p>
                    <p>{getEstimateRevenueInEth(amount, unitPrice)}&nbsp;ETH&nbsp;≈&nbsp;${getEstimateRevenueInUsd(amount, unitPrice, ethPrice?.data?.amount)}</p>
                  </div>
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

export default CreateListingModal;
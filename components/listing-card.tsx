'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader, Chip,
  Modal, ModalBody,
  ModalContent, ModalFooter,
  Progress, Tab, Tabs,
  Tooltip,
  useDisclosure
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { formatEther, parseEther } from "viem";
import { getBigInt, Signature, verifyTypedData } from "ethers";
import { EthereumIcon, QuestionIcon } from "@/components/icons";
import { Divider } from "@nextui-org/divider";
import { SimpleTimer } from "@/components/count-down-timer";
import { Link } from "@nextui-org/link";
import MarketABI from "@/abi/Market.json";
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import {
  API_ENDPOINT, FREEZE_ORDER_TYPES, LIQUIDITY_REWARD_RATE,
  MARKET_CONTRACT_ADDRESS,
  MARKET_CONTRACT_DOMAIN,
  MARKET_CONTRACT_ORDER_TYPES, PROTOCOL_FEE_RATE
} from "@/config/constants";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { Spinner } from "@nextui-org/spinner";
import useSWR, { useSWRConfig } from "swr";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@nextui-org/shared-icons";
import { ModalHeader } from "@nextui-org/modal";
import { useEthersSigner } from "@/hook/ethers";
import BigNumber from "bignumber.js";

export interface ListingCardProps {
  id: number;
  tick: string;
  quantity: string;
  unitPrice: string;
  startTime: number;
  endTime: number;
  seller: string;
  ethPrice: string;
  isSelf?: boolean;
  input: string
  signature: string
  address: string
  setParentRefetch?: (refetch: boolean) => void
  sell: boolean
}

const shorten = (address: string): string => {
  // check if address is valid
  if (address.length < 2 || address.length < 8) return address;
  return address.slice(0, 6) + '...' + address.slice(-4)
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ListingCard = (props: ListingCardProps) => {
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onOpenChange: onConfirmModalOpenChange,
  } = useDisclosure()

  const [confirming, setConfirming] = useState(false)
  const signer = useEthersSigner()


  const alertUser = (e: any) => {
    e.preventDefault();
    e.returnValue = "";
  };

  useEffect(() => {
    if (confirming) {
      window.addEventListener("beforeunload", alertUser);
      return () => {
        window.removeEventListener("beforeunload", alertUser);
      };
    }
  }, [confirming]);

  const isExpired = useMemo(() => {
    return Date.now() > props.endTime
  }, [props.endTime])

  const {address, isConnected, isDisconnected} = useAccount();
  const userTokenBalanceUrl = address ? `${API_ENDPOINT}/holders/${address}?tick=${props.tick}` : null
  const {
    data: userTokenBalanceData,
    error: userTokenBalanceError
  } = useSWR(userTokenBalanceUrl, fetcher, {refreshInterval: 20000});

  const userTokenBalance = useMemo(() => {
    if (userTokenBalanceData?.tokens?.length > 0) {
      return userTokenBalanceData.tokens[0].balance;
    }
    return "0";
  }, [userTokenBalanceData])

  const parsedInput = useCallback(() => {
    if (props.input === undefined) {
      return {}
    } else {
      return JSON.parse(props.input)
    }
  }, [props])

  const orderArgs = useCallback(() => {
    const sig = Signature.from(props.signature)
    return {
      ...parsedInput(),
      v: sig.v,
      r: sig.r,
      s: sig.s,
    }
  }, [parsedInput, props.signature])

  const totalPriceInEth = (quantity: string, unitPrice: string): string => {
    const quantityNum = getBigInt(quantity)
    const unitPriceBigInt = getBigInt(unitPrice)
    const totalPrice = quantityNum * unitPriceBigInt
    return new Intl.NumberFormat('en-US', {maximumFractionDigits: 10})
      .format(Number(formatEther(totalPrice)))
  }

  const protocolFeeInEth = useMemo(() => {
    const feeInWei = Number(parseEther(
      totalPriceInEth(
        props.quantity,
        props.unitPrice
      )
    )) * (PROTOCOL_FEE_RATE + LIQUIDITY_REWARD_RATE)
    return formatEther(getBigInt(feeInWei.toString()))
  }, [props.quantity, props.unitPrice])

  const takeOrderValue = useCallback(() => {

    if (props.sell) {
      const unitPrice = getBigInt(parsedInput().price)
      const quantity = getBigInt(parsedInput().amount)
      const orderValue = unitPrice * quantity
      const protocolFee = getBigInt((Number(orderValue) * (PROTOCOL_FEE_RATE + LIQUIDITY_REWARD_RATE)).toString())
      return orderValue + protocolFee
    } else {
      // buy order
      if (protocolFeeInEth === undefined) {
        return parseEther('0')
      }
      return parseEther(protocolFeeInEth)
    }

  }, [parsedInput, props.sell, protocolFeeInEth])

  const {mutate} = useSWRConfig()
  const ordersEpStart = `${API_ENDPOINT}/market/orders`

  const {
    data: takeOrderResult,
    write: takeOrder,
    isLoading: takeOrderLoading
  } = useContractWrite({
    // @ts-ignore
    address: MARKET_CONTRACT_ADDRESS,
    abi: MarketABI,
    functionName: 'executeOrder',
    args: [
      orderArgs(),
      props.address
    ],
    value: takeOrderValue(),
    onSuccess: () => {
      enqueueSnackbar('Success: Tx sent', {variant: 'success'})
    },
    onError: (e: any) => {
      console.log(e)
      enqueueSnackbar(`Error: Tx failed to send. Reason: ${e.shortMessage}`, {
        variant: 'error',
        persist: true,
        action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
      })
      props.setParentRefetch?.(true)
      setConfirming(false)
    },
  })

  const {
    isLoading: waitTakeTxLoading,
    isError: waitTakeTxError,
  } = useWaitForTransaction({
    hash: takeOrderResult?.hash,
    onError: (e) => {
      console.log(e)
      enqueueSnackbar(`Error: Tx failed to complete.`, {
        variant: 'error',
        persist: true,
        action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
      })
    },
    onSuccess: () => {
      const executeOrderEp = `${API_ENDPOINT}/market/orders/${props.id}/execute`
      fetch(executeOrderEp, {
        method: 'POST',
        body: JSON.stringify({
          tx: takeOrderResult?.hash
        })
      })
        .then(r => {
          if (r.ok) {
            enqueueSnackbar('Success: Order executed', {variant: 'success'})
          } else {
            enqueueSnackbar('Error: Failed to update order status', {variant: 'error'})
          }
        })
        .catch((e) => {
          console.log(e)
          enqueueSnackbar('Error: Failed to update order status', {variant: 'error'})
        })
        .finally(() => {
          props.setParentRefetch?.(true)
          setConfirming(false)
          // refetch order
          mutate(
            key => typeof key === 'string' && key.startsWith(ordersEpStart),
          )
        })
    },
  })

  const {
    data: cancelOrderResult,
    write: cancelOrder,
    isLoading: cancelOrderLoading
  } = useContractWrite({
    // @ts-ignore
    address: MARKET_CONTRACT_ADDRESS,
    abi: MarketABI,
    functionName: 'cancelOrder',
    args: [
      orderArgs(),
    ],
    onSuccess: () => {
      enqueueSnackbar('Success: Tx sent', {variant: 'success'})
    },
    onError: (e: any) => {
      console.log(e)
      enqueueSnackbar(
        `Error: Tx failed to send. Reason: ${e.shortMessage}`,
        {
          variant: 'error',
          persist: true,
          action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
        },
      )
      props.setParentRefetch?.(true)
      setConfirming(false)
    }
  })

  const {
    isLoading: waitCancelTxLoading,
    isError: waitCancelTxError,
  } = useWaitForTransaction({
    hash: cancelOrderResult?.hash,
    onError: (e) => {
      console.log(e)
      enqueueSnackbar('Error: Tx failed to complete:', {
        variant: 'error',
        persist: true,
        action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
      })
    },
    onSuccess: () => {
      const cancelOrderEp = `${API_ENDPOINT}/market/orders/${props.id}/cancel`
      fetch(cancelOrderEp, {
        method: 'POST',
        body: JSON.stringify({
          tx: cancelOrderResult?.hash
        })
      })
        .then(r => {
          if (r.status === 200 || r.status === 204) {
            enqueueSnackbar('Success: Order cancelled', {variant: 'success'})
          } else {
            enqueueSnackbar('Error: Failed to update order status', {variant: 'error'})
          }
        })
        .catch((e) => {
          console.log(e)
          enqueueSnackbar('Error: Failed to update order status', {variant: 'error'})
        })
        .finally(() => {
          props.setParentRefetch?.(true)
          setConfirming(false)
          // refetch order
          mutate(
            key => typeof key === 'string' && key.startsWith(ordersEpStart),
          )
        })
    },
  })


  const totalPriceInUsd = useCallback((quantity: string, unitPrice: string): string => {
    const quantityNum = getBigInt(quantity)
    const unitPriceBigInt = getBigInt(unitPrice)
    const totalPrice = quantityNum * unitPriceBigInt
    const totalPriceInEth = formatEther(totalPrice)
    const totalPriceInUsd = Number(totalPriceInEth) * Number(props.ethPrice)
    return new Intl.NumberFormat('en-US').format(totalPriceInUsd)
  }, [props.ethPrice])

  const unitPriceString = (unitPrice: string): string => {
    const unitPriceInEth = formatEther(getBigInt(unitPrice))
    const unitPriceInUsd = Number(unitPriceInEth) * Number(props.ethPrice)
    return `${unitPriceInEth} ETH ≈ $ ${new Intl.NumberFormat('en-US').format(unitPriceInUsd)}`
  }

  const unitPriceInUsd = (unitPrice: string): string => {
    const unitPriceInEth = formatEther(getBigInt(unitPrice))
    const unitPriceInUsd = Number(unitPriceInEth) * Number(props.ethPrice)
    return new Intl.NumberFormat('en-US').format(unitPriceInUsd)
  }

  const onTake = useCallback(() => {
    onConfirmModalOpenChange()
  }, [onConfirmModalOpenChange])

  const onConfirm = useCallback(() => {
    if (takeOrder === undefined) {
      enqueueSnackbar('Error: Contract not ready', {variant: 'error'})
      return
    }

    props.setParentRefetch?.(false)
    setConfirming(true)

    // if confirming sell order, just call takeOrder
    // if confirming buy order, sign first, then call freeze order first, when success, call takeOrder

    if (props.sell) {
      takeOrder()
    } else {
      if (signer === undefined) {
        enqueueSnackbar('Error: Wallet not connected', {variant: 'error'})
        return
      }

      signer.signTypedData(
        MARKET_CONTRACT_DOMAIN,
        FREEZE_ORDER_TYPES,
        {
          owner: props.address,
          tick: props.tick,
          amount: props.quantity,
        }
      )
        .then((signature) => {
          fetch(`${API_ENDPOINT}/market/orders/${props.id}/freeze`, {
            method: 'POST',
            body: JSON.stringify({
              signature: signature,
              address: props.address,
            }),
          })
            .then(r => {
              if (r.status === 200 || r.status === 204) {
                enqueueSnackbar('Success: Order frozen', {variant: 'success'})
                takeOrder()
              } else {
                enqueueSnackbar('Error: Failed to freeze order', {variant: 'error'})
                setConfirming(false)
              }
            })
            .catch(e => {
              console.log(e)
              enqueueSnackbar('Error: Failed to freeze order', {variant: 'error'})
              setConfirming(false)
            })

        })
        .catch((e) => {
          console.log(e)
          if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
            enqueueSnackbar('User rejected sign', {variant: 'warning'})
          } else {
            enqueueSnackbar('Error: Failed to sign', {variant: 'error'})
          }
          setConfirming(false)
        })

    }


  }, [props, signer, takeOrder])

  const onCancel = useCallback(() => {

    if (cancelOrder === undefined) {
      enqueueSnackbar('Error: Contract not ready', {variant: 'error'})
      return
    }
    props.setParentRefetch?.(false)
    setConfirming(true)
    cancelOrder()

  }, [cancelOrder, props])


  const protocolFeeInUsd = useMemo(() => {
    return Number(protocolFeeInEth) * Number(props.ethPrice)
  }, [protocolFeeInEth, props.ethPrice])

  const totalPayInEth = useMemo(() => {
    const protocolFee = new BigNumber(Number(formatEther(parseEther(protocolFeeInEth))))
    const orderValue = new BigNumber(Number(formatEther(getBigInt(props.quantity) * getBigInt(props.unitPrice))))
    return protocolFee.plus(orderValue).toString()
  }, [props, protocolFeeInEth])

  const totalPayInUsd = useMemo(() => {
    return Number(totalPayInEth) * Number(props.ethPrice)
  }, [totalPayInEth, props])


  const cardFooter = useMemo(() => {
    if (!isConnected || isDisconnected) {
      return (
        <Tooltip content="Please connect your wallet">
          <span>
            <Button color="primary" className="font-bold" isDisabled>
            Take
            </Button>
          </span>
        </Tooltip>
      )
    }

    if (takeOrderLoading || waitTakeTxLoading || waitCancelTxLoading || cancelOrderLoading || confirming) {
      return (
        <Button color="primary" className="font-bold" isDisabled startContent={<Spinner color="white"/>}>
          Confirming...
        </Button>
      )
    }

    let takeButton = (
      <Button color="primary" className="font-bold" onPress={onTake} isDisabled={isExpired}>
        Take
      </Button>
    )

    // only check user token balance if it's a bid order
    if (userTokenBalance && !props.sell) {
      if (Number(userTokenBalance) < Number(props.quantity)) {
        takeButton = (
          <Tooltip content="Insufficient Token balance">
            <span>
              <Button color="primary" className="font-bold" isDisabled>
                Take
              </Button>
            </span>
          </Tooltip>
        )
      }
    }

    if (props.isSelf) {
      return (
        <div className="flex flex-row justify-between w-full">
          <Button color="danger" className="font-bold" variant={"ghost"} onPress={onCancel}>
            Cancel
          </Button>
          {takeButton}
        </div>
      )
    }
    return takeButton
  }, [
    takeOrderLoading, waitTakeTxLoading, waitCancelTxLoading,
    cancelOrderLoading, props, onTake, onCancel, confirming,
    userTokenBalance, isConnected, isDisconnected, isExpired
  ])

  const modalFooter = useMemo(() => {
    if (takeOrderLoading || waitTakeTxLoading || waitCancelTxLoading || cancelOrderLoading || confirming) {
      return (
        <Button color="primary" className="font-bold" isDisabled startContent={<Spinner color="white"/>}>
          Confirming...
        </Button>
      )
    }

    return (
      <div className="flex flex-row gap-4">
        <Button color="danger" className="font-bold" variant={"ghost"} onPress={() => {
          onConfirmModalOpenChange()
          setConfirming(false)
        }}>
          Cancel
        </Button>
        <Button color="primary" className="font-bold" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    )
  }, [
    cancelOrderLoading, confirming, onConfirm, onConfirmModalOpenChange, takeOrderLoading,
    waitCancelTxLoading, waitTakeTxLoading
  ])

  const summaryComponent = useMemo(() => {
    if (props.sell) {
      return (
        <div>
          <div className="flex flex-row justify-between">
            <p className="font-mono">Order Value:</p>
            <p className="font-mono font-bold">{totalPriceInEth(props.quantity, props.unitPrice)} ETH ≈
              $ {totalPriceInUsd(props.quantity, props.unitPrice)}</p>
          </div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-1">
              <p className="font-mono">Protocol Fee:</p>
              <Chip size="sm" color="warning">
                {new Intl.NumberFormat('en-US', {
                    style: 'percent',
                    maximumFractionDigits: 2
                  }
                ).format(PROTOCOL_FEE_RATE + LIQUIDITY_REWARD_RATE)}
              </Chip>
            </div>
            <p className="font-mono font-bold">{protocolFeeInEth} ETH ≈ $ {
              new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(protocolFeeInUsd)}</p>
          </div>
          <div className="flex flex-row justify-between">
            <p className="font-mono">Total:</p>
            <p className="font-mono font-bold">{totalPayInEth} ETH ≈
              $ {new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(totalPayInUsd)}</p>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-medium mt-2">You will pay:</p>
            <div className="flex flex-row justify-between text-default-500">
              <div className="flex flex-row gap-1">
                <p className="font-mono">Protocol Fee:</p>
                <Chip size="sm" color="warning">
                  {new Intl.NumberFormat('en-US', {
                      style: 'percent',
                      maximumFractionDigits: 2
                    }
                  ).format(PROTOCOL_FEE_RATE + LIQUIDITY_REWARD_RATE)}
                </Chip>
              </div>
              <p className="font-mono font-bold">{protocolFeeInEth} ETH ≈ $ {
                new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(protocolFeeInUsd)}</p>
            </div>
            <div className="flex flex-row justify-between text-default-500">
              <div className="flex flex-row gap-1">
                <p className="font-mono">Bid Quantity:</p>
              </div>
              <p
                className="font-mono font-bold">{
                new Intl.NumberFormat(
                  'en-US', {maximumFractionDigits: 2}
                ).format(Number(props.quantity))} {props.tick}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <p className="font-mono text-medium mt-2">You will get:</p>
            <div className="flex flex-row justify-between text-default-500">
              <div className="flex flex-row gap-1">
                <p className="font-mono">Order Value:</p>
              </div>
              <p
                className="font-mono font-bold">{totalPriceInEth(props.quantity, props.unitPrice)} ETH ≈
                $ {totalPriceInUsd(props.quantity, props.unitPrice)}</p>
            </div>
          </div>
        </div>
      )
    }


  }, [
    props, protocolFeeInEth, protocolFeeInUsd,
    totalPayInEth, totalPayInUsd, totalPriceInUsd
  ])


  return (
    <div>
      <Card
        classNames={{
          base: "border-2 border-default-500/30 hover:border-primary-500",
        }}
      >
        <CardHeader>
          <div className="flex flex-row justify-between w-full">
            <p className="text-sm font-bold">{props.tick}</p>
            <div className="flex flex-row gap-1">
              {props.sell ? <ArrowRightIcon/> : <ArrowLeftIcon/>}
              <p className="text-xs font-bold font-mono">{props.sell ? "sell" : "buy"}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="font-mono">
          <div className="flex flex-row items-center justify-center font-bold mb-2">
            <p className="text-2xl">{new Intl.NumberFormat('en-US').format(Number(props.quantity))}</p>
          </div>
          <div className="flex flex-row items-end justify-center">
            <p className="text-xs">{formatEther(getBigInt(props.unitPrice))}</p>
            <div className="flex flex-row items-end justify-center text-center">
              <p className="text-xs">&nbsp;</p>
              <EthereumIcon/>
              <p className="text-xs">&nbsp;/&nbsp;</p>
              <p className="text-xs">{props.tick}</p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center mt-1">
            <p className="text-xs">$&nbsp;{unitPriceInUsd(props.unitPrice)}</p>
          </div>
          <Divider className="mt-2"/>
          <div className="flex flex-row justify-between mt-4">
            <div className="flex flex-row gap-2">
              <EthereumIcon/>
              <p className="text-sm">{totalPriceInEth(props.quantity, props.unitPrice)}</p>
            </div>
            <p className="text-sm">$&nbsp;{totalPriceInUsd(props.quantity, props.unitPrice)}</p>
          </div>
          <div className="flex flex-row justify-center items-end mt-2 w-full">
            {/*<p className="text-sm">Seller</p>*/}
            <Tooltip content={`Order Maker: ${props.seller}`}>
              <Link
                color={"foreground"}
                href={`/address/${props.seller}`}
                className="text-xs"
                underline={"hover"}
                size={"sm"}
              >
                {shorten(props.seller)}
              </Link>
            </Tooltip>

            {/*<p className="text-xs">{props.seller}</p>*/}
          </div>
          <Divider className="mt-2 mb-2"/>
          {isExpired ?
            <span
              className="text-xs font-bold text-red-500 w-full text-center"
            >
              expired
            </span>
            :
            <Progress
              aria-label="progress"
              showValueLabel={true}
              size="sm"
              isStriped
              color={"secondary"}
              label={"Expires in"}
              valueLabel={<SimpleTimer targetDate={props.endTime}/>}
              value={(Date.now() - props.startTime) / (props.endTime - props.startTime) * 100}
              classNames={{
                label: "text-xs",
                value: "text-xs",
                // labelWrapper: labelWrapperClassname,
                base: "!gap-0",
              }}
              formatOptions={{
                maximumFractionDigits: 4,
                style: "percent",
              }}
            />}
        </CardBody>
        <CardFooter className="flex flex-row justify-center items-center font-bold">
          {cardFooter}
        </CardFooter>
      </Card>
      <Modal
        isOpen={isConfirmModalOpen}
        onOpenChange={onConfirmModalOpenChange}
        isDismissable={!confirming}
        isKeyboardDismissDisabled={!confirming}
        hideCloseButton={confirming}
        backdrop="blur"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-bold text-center">
                Order Confirmation
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 rounded-md sm:p-4 p-2 border-default border-2">
                    <p className="text-sm font-bold">Order Details</p>
                    <div className="flex flex-row justify-between items-center font-mono">
                      <p>Type:</p>
                      <Button
                        color="success"
                        className="font-mono font-bold text-sm"
                        size="sm"
                        disableRipple
                        disableAnimation
                      >
                        {props.sell ? "Ask" : "Bid"}
                      </Button>

                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="font-mono">Tick:</p>
                      <p className="font-mono font-bold">{props.tick}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="font-mono">Quantity:</p>
                      <p
                        className="font-mono font-bold">{new Intl.NumberFormat('en-US').format(Number(props.quantity))}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="font-mono">Unit Price:</p>
                      <p className="font-mono font-bold">{formatEther(getBigInt(props.unitPrice))} ETH ≈
                        $ {unitPriceInUsd(props.unitPrice)}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="font-mono">Total Price</p>
                      <p className="font-mono font-bold">{totalPriceInEth(props.quantity, props.unitPrice)} ETH ≈
                        $ {totalPriceInUsd(props.quantity, props.unitPrice)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 rounded-md sm:p-4 p-2 border-default border-2">
                    <p className="text-sm font-bold">Summary</p>
                    {summaryComponent}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                {modalFooter}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ListingCard;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardFooter, CardHeader, Progress } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { formatEther } from "viem";
import { getBigInt, Signature, verifyTypedData } from "ethers";
import { EthereumIcon } from "@/components/icons";
import { Divider } from "@nextui-org/divider";
import { SimpleTimer } from "@/components/count-down-timer";
import { Link } from "@nextui-org/link";
import MarketABI from "@/abi/Market.json";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import {
  API_ENDPOINT,
  MARKET_CONTRACT_ADDRESS,
  MARKET_CONTRACT_DOMAIN,
  MARKET_CONTRACT_ORDER_TYPES
} from "@/config/constants";
import { enqueueSnackbar } from "notistack";
import { Spinner } from "@nextui-org/spinner";
import { useSWRConfig } from "swr";

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
}

const shorten = (address: string): string => {
  // check if address is valid
  if (address.length < 2 || address.length < 8) return address;
  return address.slice(0, 6) + '...' + address.slice(-4)
}

const ListingCard = (props: ListingCardProps) => {

  const [confirming, setConfirming] = useState(false)

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

  const takeOrderValue = useCallback(() => {
    const unitPrice = getBigInt(parsedInput().price)
    const quantity = getBigInt(parsedInput().amount)
    return unitPrice * quantity
  }, [parsedInput])

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
      if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
        enqueueSnackbar('User rejected transaction', {variant: 'warning'})
      } else {
        enqueueSnackbar('Error: Tx failed to send', {variant: 'error'})
      }
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
      enqueueSnackbar('Error: Tx failed to complete:', {variant: 'error'})
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
      if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
        enqueueSnackbar('User rejected transaction', {variant: 'warning'})
      } else {
        enqueueSnackbar('Error: Tx failed to send', {variant: 'error'})
      }
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
      enqueueSnackbar('Error: Tx failed to complete:', {variant: 'error'})
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

  const totalPriceInEth = (quantity: string, unitPrice: string): string => {
    const quantityNum = getBigInt(quantity)
    const unitPriceBigInt = getBigInt(unitPrice)
    const totalPrice = quantityNum * unitPriceBigInt
    return new Intl.NumberFormat('en-US', {maximumFractionDigits: 10})
      .format(Number(formatEther(totalPrice)))
  }

  const totalPriceInUsd = (quantity: string, unitPrice: string): string => {
    const quantityNum = getBigInt(quantity)
    const unitPriceBigInt = getBigInt(unitPrice)
    const totalPrice = quantityNum * unitPriceBigInt
    const totalPriceInEth = formatEther(totalPrice)
    const totalPriceInUsd = Number(totalPriceInEth) * Number(props.ethPrice)
    return new Intl.NumberFormat('en-US').format(totalPriceInUsd)
  }

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

  const onBuy = useCallback(() => {

    if (takeOrder === undefined) {
      enqueueSnackbar('Error: Contract not ready', {variant: 'error'})
      return
    }

    props.setParentRefetch?.(false)
    setConfirming(true)
    takeOrder()

  }, [takeOrder, props])

  const onCancel = useCallback(() => {

    if (cancelOrder === undefined) {
      enqueueSnackbar('Error: Contract not ready', {variant: 'error'})
      return
    }
    props.setParentRefetch?.(false)
    setConfirming(true)
    cancelOrder()

  }, [cancelOrder, props])

  const cardFooter = useMemo(() => {
    if (takeOrderLoading || waitTakeTxLoading || waitCancelTxLoading || cancelOrderLoading || confirming) {
      return (
        <Button color="primary" className="font-bold" isDisabled startContent={<Spinner color="white"/>}>
          Confirming...
        </Button>
      )
    }

    if (props.isSelf) {
      return (
        <div className="flex flex-row justify-between w-full">
          <Button color="danger" className="font-bold" variant={"ghost"} onPress={onCancel}>
            Cancel
          </Button>
          <Button color="primary" className="font-bold" onPress={onBuy}>
            Buy
          </Button>
        </div>
      )
    }
    return (
      <Button color="primary" className="font-bold" onClick={onBuy}>
        Buy
      </Button>
    )
  }, [
    takeOrderLoading, waitTakeTxLoading, waitCancelTxLoading,
    cancelOrderLoading, props, onBuy, onCancel, confirming
  ])


  return (
    <div>
      <Card
        classNames={{
          base: "border-2 border-default-500/30 hover:border-primary-500",
        }}
      >
        <CardHeader>
          <p className="text-sm font-bold">{props.tick}</p>
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
            <Link
              color={"foreground"}
              href={`/address/${props.seller}`}
              className="text-xs"
              underline={"hover"}
              size={"sm"}
            >
              {shorten(props.seller)}
            </Link>
            {/*<p className="text-xs">{props.seller}</p>*/}
          </div>
          <Divider className="mt-2 mb-2"/>
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
          />
        </CardBody>
        <CardFooter className="flex flex-row justify-center items-center font-bold">
          {cardFooter}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ListingCard;
'use client'

import React, { FC, useCallback, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hook/ethers";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { formMintInput } from "@/utils/tx-message";
import { CloseIcon } from "@nextui-org/shared-icons";
import { formatEther } from "viem";
import { getBigInt } from "ethers";

export interface MintTokenModalProps {
  tokenName: string;
  amountLimit: number;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MintTokenModal: FC<MintTokenModalProps> = ({
  isOpen, onOpenChange, tokenName, amountLimit
}: MintTokenModalProps) => {
  const [amt, setAmt] = useState('');
  const [amtValid, setAmtValid] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const {address, isConnected, isDisconnected} = useAccount();
  const signer = useEthersSigner();

  const mintDisabled = useMemo(() => {
    return !amtValid || isConfirming || !isConnected || isDisconnected || !signer || !amt || amt === '0' || amt === '';
  }, [amt, amtValid, isConfirming, isConnected, isDisconnected, signer]);

  const onAmtChange = useCallback((value: string) => {
    const numericValue = Number(value);
    setAmt(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setAmtValid(false);
      return;
    }
    if (amountLimit && numericValue > amountLimit) {
      setAmtValid(false);
      return;
    }

    setAmtValid(true);
  }, [amountLimit]);

  const onMint = useCallback(() => {
    if (!isConnected || isDisconnected) {
      enqueueSnackbar("Please connect your wallet", {variant: "error"});
      return;
    }

    if (!signer) {
      enqueueSnackbar("Please connect your wallet", {variant: "error"});
      return;
    }

    if (!amtValid) {
      enqueueSnackbar("Invalid amount", {variant: "error"});
      return;
    }

    const inputData = formMintInput({
      amount: amt,
      tick: tokenName,
    })

    const tx = {
      to: address,
      data: inputData,
    }

    setIsConfirming(true);
    signer.sendTransaction(tx)
      .then((tx) => {
        enqueueSnackbar('Mint Tx successfully sent', {variant: 'success'})
        onOpenChange && onOpenChange(false);
      })
      .catch((err) => {
        if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
          enqueueSnackbar('Mint cancelled', {variant: 'warning'})
        } else {
          console.log(err)
          enqueueSnackbar(`Mint failed. Reason: ${err.code}`, {
            variant: 'error',
            persist: true,
            action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
          })
        }
      })
      .finally(() => {
        setIsConfirming(false)
        onOpenChange && onOpenChange(false);
      })
  }, [
    address, amt, amtValid, isConnected, isDisconnected,
    onOpenChange, signer, tokenName
  ])

  const amountInputEndContent = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onPress={() => setAmt("")} isIconOnly radius="md">
          <CloseIcon/>
        </Button>
        <Button size="sm" color="primary" onPress={() => setAmt(amountLimit.toString())}>
          <p className="font-bold">Auto</p>
        </Button>
      </div>
    )
  }, [amountLimit])


  return <>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 font-bold text-center text-xl">
              Mint {tokenName}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex justify-between items-start">
                  <Input
                    size="lg"
                    label={"Amount"}
                    labelPlacement={"outside"}
                    variant="bordered"
                    className={"font-mono"}
                    isRequired
                    value={amt}
                    onValueChange={onAmtChange}
                    isInvalid={!amtValid}
                    errorMessage={!amtValid && "Invalid amount"}
                    endContent={amountInputEndContent}
                  />
                </div>
                {/*create a notice section*/}
                <div className="flex flex-row gap-2">
                  <p className="text-lg text-gray-400">Notice: </p>
                  <p className="text-sm text-gray-500">
                    Minting {tokenName} is free; therefore, the most effective approach is to mint the maximum amount
                    within the given limit at once.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {isConfirming ? (
                  <Button color="primary" isDisabled startContent={<Spinner color={"white"}/>}>
                    Confirming...
                  </Button>
                )
                :
                (
                  <>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" isDisabled={mintDisabled} onPress={onMint}>
                      Mint
                    </Button>
                  </>
                )
              }

            </ModalFooter>
          </>
        )}
      </ModalContent>

    </Modal>
  </>
}
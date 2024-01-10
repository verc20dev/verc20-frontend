'use client'

import { FC, useCallback, useState } from "react";
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
import { enqueueSnackbar } from "notistack";
import { formMintInput } from "@/utils/tx-message";

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
  const [amtValid, setAmtValid] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const {address, isConnected, isDisconnected} = useAccount();
  const signer = useEthersSigner();

  const mintDisabled = !amtValid || isConfirming;

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
        if (err.code === 4001) {
          enqueueSnackbar('Mint cancelled', {variant: 'warning'})
        } else {
          console.log(err)
          enqueueSnackbar('Mint failed', {variant: 'error'})
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
                  <p className="font-bold">Amount:</p>
                  <Input
                    size="sm"
                    variant="bordered"
                    fullWidth={false}
                    className={"w-[200px] sm:w-[250px] font-mono"}
                    value={amt}
                    onValueChange={onAmtChange}
                    isInvalid={!amtValid}
                    errorMessage={!amtValid && "Invalid amount"}
                  />
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
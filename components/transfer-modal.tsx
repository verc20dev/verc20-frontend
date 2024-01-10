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
import { parseEther, isAddress } from "viem";
import { formTransferInput } from "@/utils/tx-message";

export interface TransferTokenModalProps {
  tokenName: string;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TransferTokenModal: FC<TransferTokenModalProps> = ({
  tokenName,
  isOpen,
  onOpenChange
}: TransferTokenModalProps) => {
  const [amt, setAmt] = useState('');
  const [amtValid, setAmtValid] = useState(false);

  const [recipient, setRecipient] = useState('');
  const [recipientValid, setRecipientValid] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);

  const [transferDisabled, setTransferDisabled] = useState(true);
  const {address, isConnected, isDisconnected} = useAccount();
  const signer = useEthersSigner();


  const onAmtChange = useCallback((value: string) => {
    const numericValue = Number(value);
    setAmt(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setAmtValid(false);
      setTransferDisabled(true);
      return;
    }
    // TODO: add balance check
    setAmtValid(true);
    if (recipientValid) {
      setTransferDisabled(false);
    }
  }, [recipientValid]);

  const onRecipientChange = useCallback((value: string) => {
    setRecipient(value);
    // check if string is valid address
    if (!isAddress(value)) {
      setRecipientValid(false);
      setTransferDisabled(true)
      return;
    }
    setRecipientValid(true);
    if (amtValid) {
      setTransferDisabled(false);
    }
  }, [amtValid]);

  const onTransfer = useCallback(() => {
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

    if (!recipientValid) {
      enqueueSnackbar("Invalid recipient", {variant: "error"});
      return;
    }

    const inputData = formTransferInput({
      amount: amt,
      tick: tokenName,
    })

    const tx = {
      to: recipient,
      value: parseEther("0"),
      data: inputData,
    }

    setIsConfirming(true);
    signer.sendTransaction(tx)
      .then(() => {
        enqueueSnackbar("Transfer Tx successful sent", {variant: "success"});
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
    amt, amtValid, isConnected, isDisconnected, onOpenChange, recipient,
    recipientValid, signer, tokenName
  ])


  return <>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 font-bold text-center text-xl">
              Transfer {tokenName}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-start">
                  <p className="font-bold mb-2 sm:mb-0">Recipient:</p>
                  <Input
                    size="sm"
                    variant="bordered"
                    fullWidth={false}
                    className={"w-full sm:w-[420px] font-mono"}
                    value={recipient}
                    onValueChange={onRecipientChange}
                    isInvalid={!recipientValid}
                    errorMessage={!recipientValid && "Invalid recipient address"}
                    isClearable
                  />
                </div>
                <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-start">
                  <p className="font-bold mb-2 sm:mb-0">Amount:</p>
                  <Input
                    size="sm"
                    variant="bordered"
                    fullWidth={false}
                    className={"w-full sm:w-[420px] font-mono"}
                    value={amt}
                    onValueChange={onAmtChange}
                    isInvalid={!amtValid}
                    errorMessage={!amtValid && "Invalid amount"}
                    isClearable
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
                    <Button color="primary" isDisabled={transferDisabled} onPress={onTransfer}>
                      Transfer
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
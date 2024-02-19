'use client'

import React, { FC, useCallback, useMemo, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hook/ethers";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { isAddress, parseEther } from "viem";
import { formTransferInput } from "@/utils/tx-message";
import { API_ENDPOINT } from "@/config/constants";
import useSWR from "swr";

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

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const [amt, setAmt] = useState('');
  const [amtValid, setAmtValid] = useState(true);
  const [amountErrorText, setAmountErrorText] = React.useState<string>("");


  const [recipient, setRecipient] = useState('');
  const [recipientValid, setRecipientValid] = useState(true);

  const [isConfirming, setIsConfirming] = useState(false);

  const [transferDisabled, setTransferDisabled] = useState(true);
  const {address, isConnected, isDisconnected} = useAccount();
  const signer = useEthersSigner();

  const userBalanceUrl = `${API_ENDPOINT}/holders/${address}?tick=${tokenName}`
  const {data: userBalanceData, error: userBalanceError} = useSWR(userBalanceUrl, fetcher, {refreshInterval: 20000});

  const userBalance = useMemo(() => {
    if (userBalanceData?.tokens?.length > 0) {
      return userBalanceData.tokens[0].balance;
    }
    return "0";
  }, [userBalanceData])

  const onAmtChange = useCallback((value: string) => {
    setAmt(value);

    // check if amount NaN
    if (Number.isNaN(Number(value))) {
      setAmtValid(false);
      setAmountErrorText("Amount must be a number");
      return;
    }

    // check if amount > 0
    if (Number(value) <= 0) {
      setAmtValid(false);
      setAmountErrorText("Amount must be greater than 0");
      return;
    }

    let maxAmount = "0";
    if (userBalanceData?.tokens?.length > 0) {
      maxAmount = userBalanceData.tokens[0].balance;
    }


    if (Number(value) > Number(maxAmount)) {
      setAmtValid(false);
      setAmountErrorText("Amount must be less than or equal to your max token balance");
    } else {
      setAmtValid(true);
      setAmountErrorText("");
    }
  }, [userBalanceData]);

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
        if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
          enqueueSnackbar('Mint cancelled', {variant: 'warning'})
        } else {
          console.log(err)
          enqueueSnackbar(`Mint failed. ERR CODE: ${err.code}`, {
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
    amt, amtValid, isConnected, isDisconnected, onOpenChange, recipient,
    recipientValid, signer, tokenName
  ])

  const canTransfer = useMemo(() => {
    return isConnected && !isDisconnected && amtValid &&
      recipientValid && amt !== "" && recipient !== ""
  }, [amt, amtValid, isConnected, isDisconnected, recipient, recipientValid]);


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
                <div className="flex justify-between items-start font-mono">
                  Balance: <span className="font-bold">{userBalance}&nbsp;{tokenName}</span>
                </div>
                <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-start">
                  <Input
                    label={"Recipient"}
                    labelPlacement={"outside"}
                    placeholder=""
                    size="lg"
                    variant="bordered"
                    fullWidth={false}
                    className={"font-mono"}
                    value={recipient}
                    onValueChange={onRecipientChange}
                    isInvalid={!recipientValid}
                    errorMessage={!recipientValid && "Invalid recipient address"}
                    isClearable
                    isRequired
                  />
                </div>
                <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-start">
                  <Input
                    label="Amount"
                    labelPlacement={"outside"}
                    placeholder=""
                    size="lg"
                    variant="bordered"
                    fullWidth={false}
                    className={"font-mono"}
                    isRequired
                    value={amt}
                    onValueChange={onAmtChange}
                    isInvalid={!amtValid}
                    errorMessage={amountErrorText}
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
                    <Button color="primary" isDisabled={!canTransfer} onPress={onTransfer}>
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
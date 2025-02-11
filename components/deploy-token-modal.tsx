import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import React, { FC, useCallback, useMemo, useState } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { Tab, Tabs, Tooltip } from "@nextui-org/react";
import { useAccount } from 'wagmi'
import { parseEther } from "viem";
import { useEthersSigner } from "@/hook/ethers";
import { DeployInput, formDeployInput } from "@/utils/tx-message";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { Spinner } from "@nextui-org/spinner";
import { API_ENDPOINT, MAX_DURATION } from "@/config/constants";
import useSWR from "swr";
import { CorrectIcon, ErrorIcon, QuestionIcon } from "@/components/icons";


export interface DeployTokenModalProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DeployTokenModal: FC<DeployTokenModalProps> = ({isOpen, onOpenChange}: DeployTokenModalProps) => {
  const fetcher = (url: string) => fetch(url).then((res) => res);

  const [selectedOption, setSelectedOption] = useState("normal");
  const [tick, setTick] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [totalSupply, setTotalSupply] = useState("");
  const [limitPerMint, setLimitPerMint] = useState("");
  const [startBlock, setStartBlock] = useState("");
  const [duration, setDuration] = useState("");

  const [isTickInvalid, setIsTickInvalid] = useState(false);
  const [isDecimalsInvalid, setIsDecimalsInvalid] = useState(false);
  const [isTotalSupplyInvalid, setIsTotalSupplyInvalid] = useState(false);
  const [isLimitPerMintInvalid, setIsLimitPerMintInvalid] = useState(false);
  const [isStartBlockInvalid, setIsStartBlockInvalid] = useState(false);
  const [isDurationInvalid, setIsDurationInvalid] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);

  const {address, isConnected, isDisconnected} = useAccount();
  const signer = useEthersSigner();

  const {data, isLoading: checkTickLoading, isValidating} = useSWR(
    (tick && tick !== '') ? `${API_ENDPOINT}/tokens/${tick}` : null, fetcher
  );

  const onDecimalsChange = useCallback((value: string) => {
    setDecimals(value);
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 18) {
      setIsDecimalsInvalid(true);
      return;
    }
    setIsDecimalsInvalid(false);
  }, []);

  const onTotalSupplyChange = useCallback((value: string) => {
    setTotalSupply(value);
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      setIsTotalSupplyInvalid(true);
      return;
    }

    if (selectedOption !== 'fair' && numericValue <= 0) {
      setIsTotalSupplyInvalid(true);
      return;
    }

    setIsTotalSupplyInvalid(false);
  }, [selectedOption]);

  const onLimitPerMintChange = useCallback((value: string) => {
    setLimitPerMint(value);
    if (value === '') {
      setIsLimitPerMintInvalid(false);
      return;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setIsLimitPerMintInvalid(true);
      return;
    }

    if (!isNaN(Number(totalSupply)) && Number(totalSupply) > 0) {
      if (numericValue > Number(totalSupply)) {
        setIsLimitPerMintInvalid(true);
        return;
      }
    }

    setIsLimitPerMintInvalid(false);
  }, [totalSupply]);

  const onStartBlockChange = useCallback((value: string) => {
    setStartBlock(value);
    if (value === '') {
      setIsStartBlockInvalid(false);
      return;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setIsStartBlockInvalid(true);
      return;
    }
    setIsStartBlockInvalid(false);
  }, []);

  const onDurationChange = useCallback((value: string) => {
    setDuration(value);
    if (value === '') {
      setIsDurationInvalid(false);
      return;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue <= 0 || numericValue > MAX_DURATION) {
      setIsDurationInvalid(true);
      return;
    }
    setIsDurationInvalid(false);
  }, []);

  const onTickChange = useCallback((value: string) => {
    setTick(value);
    if (value === '') {
      setIsTickInvalid(true);
      return;
    }

  }, []);

  const deployDisabled = useCallback((): boolean => {
    if (isTickInvalid || isDecimalsInvalid || isTotalSupplyInvalid || isLimitPerMintInvalid) {
      if (selectedOption === 'fair') {
        return isTickInvalid || isDecimalsInvalid || isLimitPerMintInvalid
      }
      return true;
    }

    if (selectedOption === 'fair') {
      return isDurationInvalid || isLimitPerMintInvalid || duration === '' || limitPerMint === '';
    }

    if (selectedOption === 'normal' && totalSupply === '') {
      return true;
    }

    return tick === '';

  }, [
    duration, isDecimalsInvalid, isDurationInvalid, isLimitPerMintInvalid,
    isTickInvalid, isTotalSupplyInvalid, limitPerMint, selectedOption, tick, totalSupply
  ])


  const onConfirm = useCallback(() => {
    if (!isConnected || isDisconnected) {
      enqueueSnackbar('Please connect wallet first', {variant: 'error'})
      return;
    }

    if (!signer) {
      enqueueSnackbar('Please connect wallet first', {variant: 'error'})
      return;
    }

    if (deployDisabled()) {
      enqueueSnackbar('Please check the info and try again', {variant: 'error'})
      return;
    }

    const inputStruct: DeployInput = {
      tick: tick,
      decimals: decimals,
      totalSupply: totalSupply,
      limit: limitPerMint,
      startBlock: startBlock,
      duration: duration,
    }

    if (selectedOption === 'fair') {
      inputStruct.type = 'fair'
      inputStruct.totalSupply = ''
    }

    const inputData = formDeployInput(inputStruct);


    const tx = {
      to: address,
      value: parseEther("0"),
      data: inputData,
    }

    setIsConfirming(true)
    // send tx use ethers
    signer.sendTransaction(tx)
      .then((tx) => {
        enqueueSnackbar('Deploy Tx successfully sent', {variant: 'success'})
        onOpenChange && onOpenChange(false);
      })
      .catch((err) => {
        if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
          enqueueSnackbar('Deploy cancelled', {variant: 'warning'})
        } else {
          console.log(err)
          enqueueSnackbar(`Deploy failed. ERR CODE: ${err.code}`, {
            variant: 'error',
            persist: true,
            action: (key) => (<Button size={"sm"} onPress={() => closeSnackbar(key)}>Dismiss</Button>)
          })
        }
      })
      .finally(() => {
        setIsConfirming(false)
      })

  }, [
    address, decimals, deployDisabled, duration, isConnected, isDisconnected,
    limitPerMint, onOpenChange, signer, startBlock, tick, totalSupply, selectedOption
  ])

  const tickInputEndContent = useMemo(() => {
    const spinner = <Spinner color={"secondary"}/>;
    if (checkTickLoading || isValidating) {
      return spinner
    }
    if (tick && tick !== '' && data) {
      if (data.status === 404) {
        setIsTickInvalid(false)
        return <CorrectIcon/>
      } else {
        setIsTickInvalid(true)
        return <Tooltip content={`tick already existed.`} color="danger" defaultOpen={true}>
          <ErrorIcon/>
        </Tooltip>
      }
    }
    return spinner
  }, [checkTickLoading, data, isValidating, tick])

  const durationInputEndContent = useMemo(() => {
    if (!isDurationInvalid) {
      const text = () => {
        const seconds = Number(duration) * 12;
        if (seconds < 60) {
          return `≈ ${seconds} sec`
        }
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
          return `≈ ${minutes} min`
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
          return `≈ ${hours} hour`
        }

        const days = Math.floor(hours / 24);
        return `≈ ${days} day`
      }
      return <p className="text-xs w-28 text-end">{text()}</p>
    }
  }, [isDurationInvalid, duration])


  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-bold text-center">Deploy vERC-20 Token</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center justify-center">
                    <Tabs
                      key={"success"}
                      color={"success"}
                      aria-label="filter tab"
                      radius="md"
                      size="lg"
                      selectedKey={selectedOption}
                      onSelectionChange={(key) => setSelectedOption(key.toString())}
                    >
                      <Tab key="normal" title={"Normal"}/>
                      <Tab key="fair" title="Fairmint"/>
                    </Tabs>
                  </div>
                  <div className="flex justify-between items-start">
                    <Input
                      label="Tick"
                      labelPlacement={"outside"}
                      placeholder="Enter a tick"
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      isRequired
                      value={tick}
                      onValueChange={setTick}
                      isInvalid={isTickInvalid}
                      endContent={tickInputEndContent}
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <Input
                      label="Decimals"
                      labelPlacement={"outside"}
                      defaultValue="18"
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      value={decimals}
                      onValueChange={onDecimalsChange}
                      isInvalid={isDecimalsInvalid}
                      errorMessage={isDecimalsInvalid && "Invalid decimals"}
                    />
                  </div>
                  {(selectedOption !== 'fair') && <div className="flex justify-between items-start">
                    <Input
                      label={"Max Supply"}
                      labelPlacement={"outside"}
                      placeholder={(selectedOption !== 'fair') ? "e.g. 21000000" : "Optional"}
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      isRequired={selectedOption !== 'fair'}
                      value={totalSupply}
                      onValueChange={onTotalSupplyChange}
                      isInvalid={isTotalSupplyInvalid}
                      errorMessage={isTotalSupplyInvalid && "Invalid total supply"}
                    />
                  </div>}
                  <div className="flex justify-between items-start">
                    <Input
                      label="Limit Per Mint"
                      labelPlacement={"outside"}
                      placeholder={(selectedOption !== 'fair') ? "Optional" : "Required"}
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      value={limitPerMint}
                      onValueChange={onLimitPerMintChange}
                      isInvalid={isLimitPerMintInvalid}
                      errorMessage={isLimitPerMintInvalid && "Invalid limit per mint"}
                      isRequired={selectedOption === 'fair'}
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <Input
                      label={"Duration"}
                      labelPlacement={"outside"}
                      isClearable
                      placeholder={selectedOption === 'fair' ? "Required" : "Optional"}
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      endContent={durationInputEndContent}
                      value={duration}
                      onValueChange={onDurationChange}
                      isInvalid={isDurationInvalid}
                      errorMessage={isDurationInvalid && "Invalid mint duration"}
                      isRequired={selectedOption === 'fair'}
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <Input
                      label={"Mint start block"}
                      labelPlacement={"outside"}
                      placeholder="Optional"
                      size="lg"
                      variant="bordered"
                      fullWidth={false}
                      className={"font-mono"}
                      value={startBlock}
                      onValueChange={onStartBlockChange}
                      isInvalid={isStartBlockInvalid}
                      errorMessage={isStartBlockInvalid && "Invalid mint start block"}
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
                      <Button color="primary" isDisabled={deployDisabled()} onPress={onConfirm}>
                        Deploy
                      </Button>
                    </>)
                }
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </>
  );
}
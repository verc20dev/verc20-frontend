import { ReactNode } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Tooltip, useDisclosure } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { SwapArrowIcon } from "@/components/icons";
import * as React from "react";
import { TransferTokenModal } from "@/components/transfer-modal";
import { ArrowRightIcon } from "@nextui-org/shared-icons";

export interface HoldingCardProps {
  name: string;
  badges?: React.FC[];
  balance: string;
  price?: string;
  isSelf: boolean;
}

export const HoldingCard = ({name, badges, balance, price, isSelf}: HoldingCardProps) => {

  const {
    isOpen: transferTokenModalOpen,
    onOpen: onTransferTokenModalOpen,
    onOpenChange: onTransferTokenModalOpenChange
  } = useDisclosure()

  const nameComponent = (name: string): ReactNode => {
    const baseComponent = (name: string, displayName: string): ReactNode => (
      <Link
        underline="hover"
        className="text-2xl font-bold"
        href={`/tokens/${name}`}
      >
        {displayName}
      </Link>
    )
    if (name.length < 13) return baseComponent(name, name)
    return (
      <Tooltip
        content={name}
      >
        {baseComponent(name, name.slice(0, 13) + '...')}
      </Tooltip>
    )
  }

  const formatNumber = (balance?: string): string => {
    if (!balance || balance === '') return '-'
    const formatter = new Intl.NumberFormat('en-US')
    const num = parseFloat(balance)
    if (isNaN(num)) return '-'
    return formatter.format(num)
  }

  return (
    <Card
      isHoverable={true}
      className="min-w-[320px] sm:min-w-[280px]"
      classNames={{
        base: "border-2 border-default-500/30 hover:border-primary-500",
      }}
    >
      <CardHeader className="flex gap-3">
        <div className="w-full max-w-full flex flex-row justify-between">
          {nameComponent(name)}
          <div className="flex gap-2">
            {badges?.map((Badge, i) => <Badge key={i}/>)}
          </div>
        </div>
      </CardHeader>
      <Divider/>
      <CardBody className="gap-2 font-mono text-sm">
        <div className="flex justify-between">
          <p>Balance:</p>
          <p>{formatNumber(balance)}</p>
        </div>
        <div className="flex justify-between">
          <p>Price:</p>
          <p>{formatNumber(price)}</p>
        </div>
      </CardBody>
      <Divider/>
      <CardFooter className="flex justify-between">
        {isSelf &&
          <>
            <Button
              color="primary"
              size="sm"
              className="text-sm font-bold"
              startContent={<ArrowRightIcon/>}
              onPress={onTransferTokenModalOpen}
            >
              Transfer
            </Button>
            <TransferTokenModal
              tokenName={name}
              isOpen={transferTokenModalOpen}
              onOpenChange={onTransferTokenModalOpenChange}
            />
          </>

        }
        <Button
          color="primary"
          size="sm"
          className="text-sm font-bold"
          startContent={<SwapArrowIcon/>}
        >
          Trade
        </Button>
      </CardFooter>
    </Card>
  );
}
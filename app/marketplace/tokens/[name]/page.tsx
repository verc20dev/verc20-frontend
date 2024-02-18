'use client'

import React, { useCallback, useMemo, useState } from 'react';
import { Link } from "@nextui-org/link";
import { BackIcon, CoinIcon, EthereumIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { OfficialBadge, VerifiedBadge } from "@/components/badges";
import { Button } from "@nextui-org/button";
import useSWR from "swr";
import { API_ENDPOINT, ETH_PRICE_ENDPOINT } from "@/config/constants";
import CreateOrderModal from "@/components/create-order-modal";
import { Card, CardBody, CardFooter, CardHeader, Chip, Divider, Tab, Tabs, useDisclosure } from "@nextui-org/react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import ActivityTable from "@/components/activity-table";
import OrderTable from "@/components/order-table";
import { getBigInt } from "ethers";


const MarketTokenDetailPage = ({params}: { params: { name: string } }) => {
  const router = useRouter()

  const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) {
      throw new Error()
    }
    return r.json()
  })

  const {address, isConnected, isDisconnected} = useAccount();

  const [selectedTab, setSelectedTab] = useState<string>('listed')

  const [shouldFetch, setShouldFetch] = useState<boolean>(true)

  const shouldFetchOrders = useMemo(() => {
    return selectedTab === 'listed' && shouldFetch
  }, [selectedTab, shouldFetch])

  const shouldFetchActivities = useMemo(() => {
    return selectedTab === 'activities' && shouldFetch
  }, [selectedTab, shouldFetch])

  const shouldFetchMyOrders = useMemo(() => {
    return selectedTab === 'myOrders' && shouldFetch
  }, [selectedTab, shouldFetch])


  const {
    data: tokenData,
    error: tokenDataErr,
    isLoading: tokenLoading,
    isValidating
  } = useSWR(`${API_ENDPOINT}/market/tokens/${params.name}`, fetcher)


  const {
    data: ethPrice,
    error: ethPriceError
  } = useSWR(ETH_PRICE_ENDPOINT, fetcher, {refreshInterval: 20000});

  const {
    isOpen: creatListingModalOpen,
    onOpen: onCreateListingModalOpen,
    onOpenChange: onCreateListingModalOpenChange
  } = useDisclosure();


  const totalVolume = useCallback(() => {
    if (tokenData === undefined) {
      return "-"
    }
    const cellValue = tokenData.totalVolume

    if (cellValue === undefined || cellValue === null || cellValue === '') {
      return "-"
    } else {
      const tvlInEth = Number(formatEther(getBigInt(cellValue)))
      if (isNaN(tvlInEth)) {
        return "-"
      }
      const tvlInEthString = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 10
      }).format(tvlInEth)
      const tvlInUsd = tvlInEth * Number(ethPrice?.data?.amount)
      const tvlInUsdString = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2
      }).format(tvlInUsd)
      return (
        <div className="flex flex-row gap-2">
          <EthereumIcon/>
          <span>{tvlInEthString}</span>
          <span className="text-sm text-gray-500">≈ ${tvlInUsdString}</span>
        </div>
      )
    }
  }, [ethPrice, tokenData])

  const dailyVolume = useCallback(() => {
    if (tokenData === undefined) {
      return "-"
    }
    const cellValue = tokenData.dailyVolume

    if (cellValue === undefined || cellValue === null || cellValue === '') {
      return "-"
    } else {
      const tvlInEth = Number(formatEther(getBigInt(cellValue)))
      if (isNaN(tvlInEth)) {
        return "-"
      }
      const tvlInEthString = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 10
      }).format(tvlInEth)
      const tvlInUsd = tvlInEth * Number(ethPrice?.data?.amount)
      const tvlInUsdString = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2
      }).format(tvlInUsd)
      return (
        <div className="flex flex-row gap-2">
          <EthereumIcon/>
          <span>{tvlInEthString}</span>
          <span className="text-sm text-gray-500">≈ ${tvlInUsdString}</span>
        </div>
      )
    }
  }, [ethPrice, tokenData])

  const floorPrice = useCallback(() => {
    if (tokenData === undefined) {
      return "-"
    }
    const cellValue = tokenData.floorPrice

    if (cellValue === undefined || cellValue === null || cellValue === '') {
      return "-"
    } else {
      const floorInEth = Number(formatEther(getBigInt(cellValue)))
      if (isNaN(floorInEth)) {
        return "-"
      }
      const floorInEthString = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 10
      }).format(floorInEth)
      const floorInUsd = floorInEth * Number(ethPrice?.data?.amount)
      const floorInUsdString = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 4
      }).format(floorInUsd)
      return (
        <div className="flex flex-row gap-2">
          <EthereumIcon/>
          <span>{floorInEthString}</span>
          <span className="text-sm text-gray-500">≈ ${floorInUsdString}</span>
        </div>
      )
    }
  }, [ethPrice, tokenData])

  const holders = useCallback(() => {
    if (tokenData === undefined) {
      return "-"
    }
    const cellValue = tokenData.holders

    if (cellValue === undefined || cellValue === null || cellValue === '') {
      return "-"
    } else {
      return new Intl.NumberFormat('en-US').format(cellValue)
    }
  }, [tokenData])

  return (
    <div>
      <Link
        className="cursor-pointer text-sm"
        onPress={() => router.back()}
      >
        <BackIcon/>
        Back
      </Link>
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-row items-center justify-center gap-2 mb-4">
            <h1 className="text-5xl font-bold">{tokenData?.tick}</h1>
            {tokenData?.isVerified && <VerifiedBadge/>}
            {tokenData?.isOfficial && <OfficialBadge/>}
          </div>
          <div>
            <Button
              color={"primary"}
              className="font-bold text-lg"
              onPress={onCreateListingModalOpen}
              startContent={<CoinIcon/>}
            >
              Make Order
            </Button>
            <CreateOrderModal
              isOpen={creatListingModalOpen}
              tokenName={params.name}
              onOpenChange={onCreateListingModalOpenChange}/>
          </div>
        </div>
        <div>
          <Card className="max-w-full mt-4">
            <CardHeader className="flex gap-3 justify-between">
              <div className="flex flex-col">
                <p className="text-md font-bold">Overview</p>
              </div>
            </CardHeader>
            <Divider/>
            <CardBody className="gap-4 font-mono">
              <div className="flex justify-between">
                <p className="text-sm">Total Volume</p>
                <div className="text-sm">{totalVolume()}</div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">24H Volume</p>
                <div className="text-sm">{dailyVolume()}</div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Floor Price</p>
                <div className="text-sm">{floorPrice()}</div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Holders</p>
                <p className="text-sm">{holders()}</p>
              </div>
            </CardBody>
            <Divider/>
            <CardFooter>
            </CardFooter>
          </Card>
        </div>
        <div className="mt-6">
          <Tabs
            aria-label="Options"
            color="primary"
            variant="underlined"
            classNames={{
              base: "w-full flex justify-start items-start border-b border-divider pl-4",
              tabList: "gap-6 w-fit relative rounded-none p-0 ",
              cursor: "w-full bg-[#22d3ee]",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-[#06b6d4]"
            }}
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
          >
            <Tab
              key="askOrder"
              title={
                <div className="flex items-center space-x-2">
                  <span>Ask Orders</span>
                </div>
              }
            >
              <Card
                className="w-full flex items-center"
                classNames={{
                  base: "min-h-[400px]",
                }}
              >
                <OrderTable
                  tick={params.name}
                  shouldFetch={shouldFetchOrders}
                  // @ts-ignore
                  address={address} ethPrice={ethPrice?.data?.amount}
                  setParentRefetch={setShouldFetch}
                  type={"ask"}
                />
              </Card>
            </Tab>
            <Tab
              key="bidOrder"
              title={
                <div className="flex items-center space-x-2">
                  <span>Bid Orders</span>
                </div>
              }
            >
              <Card
                className="w-full flex items-center"
                classNames={{
                  base: "min-h-[400px]",
                }}
              >
                <OrderTable
                  tick={params.name}
                  shouldFetch={shouldFetchOrders}
                  // @ts-ignore
                  address={address} ethPrice={ethPrice?.data?.amount}
                  setParentRefetch={setShouldFetch}
                  type={"bid"}
                />
              </Card>
            </Tab>
            <Tab
              key="activities"
              title={
                <div className="flex items-center space-x-2">
                  <span>Activities</span>
                </div>
              }
            >
              <Card
                className="w-full flex items-center"
                classNames={{
                  base: "min-h-[400px]",
                }}
              >
                <ActivityTable
                  tick={params.name}
                  shouldFetch={shouldFetchActivities}
                  ethPrice={ethPrice?.data?.amount}
                />
              </Card>
            </Tab>
            <Tab
              key="myOrders"
              title={
                <div className="flex items-center space-x-2">
                  <span>My Orders</span>
                </div>
              }
            >
              <Card
                className="w-full flex items-center"
                classNames={{
                  base: "min-h-[400px]",
                }}
              >
                <OrderTable
                  tick={params.name}
                  shouldFetch={shouldFetchMyOrders}
                  // @ts-ignore
                  address={address}
                  ethPrice={ethPrice?.data?.amount}
                  justSelf={true}
                  setParentRefetch={setShouldFetch}
                  type={"ask"}
                  displayTypeToggle={true}
                />
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MarketTokenDetailPage;
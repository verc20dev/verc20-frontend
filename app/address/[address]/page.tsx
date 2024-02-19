'use client'

import { Link } from "@nextui-org/link";
import { BackIcon, OutSiteIcon, SearchIcon } from "@/components/icons";
import { notFound, useRouter } from "next/navigation";
import {
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Card,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody, TableRow, TableCell
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { enqueueSnackbar } from "notistack";
import { HoldingCard } from "@/components/holding-card";
import { OfficialBadge, OGBadge, VerifiedBadge } from "@/components/badges";
import { Input } from "@nextui-org/input";
import React, { useCallback, useMemo, useState } from "react";
import { BlockiesAvatar } from "@/components/blockies-avatar";
import { API_ENDPOINT, BLOCK_EXPLORER_URL } from "@/config/constants";
import useSWR from "swr";
import { Spinner } from "@nextui-org/spinner";
import { useEthersSigner } from "@/hook/ethers";
import ActivityTable from "@/components/activity-table";

const displayName = (address: string): string => {
  // check if address is valid
  if (address.length < 2 || address.length < 8) return address;
  return address.slice(2, 8)
}

const shorten = (address: string): string => {
  // check if address is valid
  if (address.length < 2 || address.length < 8) return address;
  return address.slice(0, 6) + '...' + address.slice(-4)
}

const mockData = [
  {
    name: 'Ordi',
    balance: '100',
    price: '100',
    badges: [OfficialBadge, VerifiedBadge, OGBadge]
  },
  {
    name: 'TechPro',
    balance: '250',
    price: '200',
    badges: [OfficialBadge, VerifiedBadge]
  },
  {
    name: 'GadgetMaster',
    balance: '50000000',
    price: '350000.1',
    badges: [OfficialBadge, OGBadge]
  },
  {
    name: 'ElectroGuru',
    balance: '750',
    price: '-',
    badges: [VerifiedBadge, OGBadge]
  },
  {
    name: 'SmartSolutions',
    balance: '300',
    price: '200.11111',
    badges: [OfficialBadge, VerifiedBadge]
  },
  {
    name: 'SmartSolutionsTTTTTT',
    balance: '300',
    price: '250',
    badges: [OfficialBadge, VerifiedBadge]
  }
]

const formQueryParam = (
  offset: number | undefined,
  limit: number | undefined,
  sort: string | undefined,
  order: string | undefined
): string | undefined => {
  const queryParams: string[] = [];
  if (offset !== undefined) {
    queryParams.push(`offset=${offset}`);
  }
  if (limit !== undefined) {
    queryParams.push(`limit=${limit}`);
  }
  if (sort !== undefined) {
    queryParams.push(`sort=${sort}`);
  }
  if (order !== undefined) {
    queryParams.push(`order=${order}`);
  }
  if (queryParams.length > 0) {
    return queryParams.join('&');
  }
  return undefined;
}

export default function AddressDetailPage({params}: { params: { address: string } }) {
  const router = useRouter()
  const fetcher = (url: string) => fetch(url).then(r => r.json())
  const [tokenNameFilter, setTokenNameFilter] = useState<string>("");
  const [appliedFilter, setAppliedFilter] = useState<string>("");

  const [offset, setOffset] = useState<number | undefined>();
  const [limit, setLimit] = useState<number | undefined>(8);
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<string | undefined>();

  const signer = useEthersSigner();
  const isSelf = signer?.address === params.address;

  let holdingsEp = `${API_ENDPOINT}/holders/${params.address}`
  const queryParam = formQueryParam(offset, limit, sort, order)
  if (queryParam !== undefined) {
    holdingsEp = `${holdingsEp}?${queryParam}`
  }

  const {data, error, isLoading, isValidating} = useSWR(holdingsEp, fetcher)
  if (error) {
    enqueueSnackbar('Error while fetching balance data', {variant: 'error'})
    console.log(error)
  }

  // request transactions
  const [txsOffset, setTxsOffset] = useState<number | undefined>();
  const txsEp = `${API_ENDPOINT}/holders/${params.address}/histories`
  const txsQueryParam = formQueryParam(txsOffset, 10, undefined, undefined)
  let txsEpWithParam = txsEp
  if (txsQueryParam !== undefined) {
    txsEpWithParam = `${txsEpWithParam}?${txsQueryParam}`
  }
  const {data: txsData, error: txsErr, isLoading: txsLoading} = useSWR(txsEpWithParam, fetcher)

  const txsItems = useMemo(() => {
    if (txsData === undefined) {
      return []
    }

    if (txsData.data === undefined) {
      return []
    }
    return txsData.data
  }, [txsData])

  const txsItemsTotal = useMemo(() => {
    if (txsData === undefined) {
      return 0
    }
    return txsData.total
  }, [txsData])

  const renderTxsCell = useCallback((item: any, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof any];

    switch (columnKey) {
      case "tick":
        return (
          <div className="flex gap-2 items-center justify-center">
            <Link
              underline="hover"
              className="text-2xl font-bold font-sans-mono"
              href={`/tokens/${item.name}`}
            >
              {item.name}
            </Link>
          </div>
        )
      case "quantity": {
        let res = new Intl.NumberFormat('en-US').format(Number(item.quantity));
        if (res === 'NaN') {
          res = '-'
        }
        return res
      }
      case "from":
      case "to":
        return (
          <Tooltip
            showArrow
            placement="top"
            content={cellValue}
            classNames={{
              base: [
                // arrow color
                "before:bg-neutral-400 dark:before:bg-white",
              ],
              content: [
                "py-2 px-4 shadow-xl font-mono",
                "text-black bg-gradient-to-br from-white to-neutral-400",
              ],
            }}
          >
            <Link
              underline="always"
              className="text-sm cursor-pointer"
              href={`/address/${cellValue}`}
            >
              {shorten(cellValue)}
            </Link>
          </Tooltip>
        );
      case "time":
        return new Date(item['created_at'] * 1000).toLocaleString()
      case "hash":
        return (
          <Link
            underline="always"
            isExternal={true}
            showAnchorIcon={true}
            className="text-sm cursor-pointer"
            href={`${BLOCK_EXPLORER_URL}/tx/${item.creation_tx}`}
          />
        );

      default:
        return cellValue;
    }
  }, []);


  const items = useMemo(() => {

    if (data === undefined) return []
    if (data.tokens === undefined) return []

    return data.tokens.map((token: any) => {
      const badges = []
      if (token.isOfficial) badges.push(OfficialBadge)
      if (token.isOG) badges.push(OGBadge)
      if (token.isVerified) badges.push(VerifiedBadge)

      return {
        name: token.name,
        balance: token.balance,
        badges: badges,
      }
    })
  }, [data])


  if (!params.address || !params.address.startsWith('0x')) {
    return notFound();
  }

  return (
    <div>
      <Link
        className="cursor-pointer text-sm"
        onPress={() => router.back()}
      >
        <BackIcon/>
        Back
      </Link>
      <div className="flex flex-col mt-6 gap-8 w-full">
        <div className="flex flex-col items-center gap-4">
          <BlockiesAvatar address={params.address} className="w-40 h-40"/>
          <div className="flex flex-col gap-2 items-center">
            <h1 className="font-bold text-5xl text-center">{displayName(params.address)}</h1>
            <div className="flex gap-2">
              <Tooltip content="Copy to clipboard">
                <Button
                  size='sm'
                  onPress={() => {
                    navigator.clipboard.writeText(params.address)
                    enqueueSnackbar('Copied to clipboard', {variant: 'success'})
                  }}
                >
                  {shorten(params.address)}
                </Button>
              </Tooltip>
              <Tooltip content="View on block explorer">
                <Button
                  size='sm'
                  isIconOnly={true}
                  aria-label="View on block explorer"
                >
                  <OutSiteIcon/>
                </Button>
              </Tooltip>
            </div>

          </div>
        </div>
        <div className="">
          <Tabs
            aria-label="Options"
            color="primary"
            variant="underlined"
            classNames={{
              base: "w-full flex justify-center items-center border-b border-divider",
              tabList: "gap-6 w-fit relative rounded-none p-0 ",
              cursor: "w-full bg-[#22d3ee]",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-[#06b6d4]"
            }}
          >
            <Tab
              key="owned"
              title={
                <div className="flex items-center space-x-2">
                  <span>Owned</span>
                </div>
              }
            >
              <Card
                className="w-full flex items-center"
                classNames={{
                  base: "min-h-[400px]",
                }}
              >
                {(isLoading || isValidating) ? <Spinner classNames={{base: "mt-[100px]"}} label="Loading..." size="lg"/> :
                  (
                    <div>
                      {items.length > 8 &&
                        <div className="w-full p-2 sm:px-8 sm:pt-4 gap-4">
                          <div className="flex flex-col max-w-full items-center sm:flex-row sm:max-w-[50%] gap-4">
                            <Input
                              isClearable
                              classNames={{
                                base: "max-w-full sm:max-w-[50%]",
                                inputWrapper: "border-1",
                              }}
                              placeholder="Filter by name..."
                              size="sm"
                              startContent={<SearchIcon className="text-default-300"/>}
                              variant="bordered"
                              value={tokenNameFilter}
                              onClear={() => setTokenNameFilter("")}
                              onValueChange={setTokenNameFilter}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setAppliedFilter(tokenNameFilter)
                                  setTokenNameFilter('')
                                }
                              }}
                            />
                            {appliedFilter !== '' &&
                              <Chip
                                color="default"
                                radius="sm"
                                size="lg"
                                onClose={() => {
                                  setAppliedFilter('')
                                }}
                                classNames={{
                                  content: "font-bold mr-1.5"
                                }}
                              >
                                {appliedFilter}
                              </Chip>
                            }
                          </div>
                        </div>
                      }
                      <div
                        className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((data: any, i: number) => (
                          <HoldingCard
                            key={i}
                            name={data.name}
                            badges={data.badges}
                            balance={data.balance}
                            price={data.price}
                            isSelf={isSelf}
                          />
                        ))}
                      </div>
                    </div>
                  )
                }

                {/* todo: add pagination */}
                {/*<Pagination*/}
                {/*  showControls*/}
                {/*  isCompact*/}
                {/*  showShadow*/}
                {/*  color="secondary"*/}
                {/*  className="mt-4 mb-2"*/}
                {/*  page={offset ? offset + 1 : 1}*/}
                {/*  total={7}*/}
                {/*  initialPage={1}*/}
                {/*  onChange={(page) => setOffset(page - 1)}*/}
                {/*/>*/}
              </Card>
            </Tab>
            <Tab
              key="activity"
              title={
                <div className="flex items-center space-x-2">
                  <span>Activity</span>
                </div>
              }
            >
              <Table
                aria-label="vERC-20 transactions"
                bottomContent={
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="secondary"
                      page={txsOffset ? txsOffset + 1 : 1}
                      total={txsItemsTotal}
                      initialPage={1}
                      onChange={(page) => setTxsOffset(page - 1)}
                    />
                  </div>
                }
                classNames={{
                  wrapper: "min-h-[300px]",
                  th: "text-center",
                  td: "text-center",
                }}
                className="font-mono"
                selectionMode="single"
              >
                <TableHeader>
                  <TableColumn key="tick">Tick</TableColumn>
                  <TableColumn key="method">Method</TableColumn>
                  <TableColumn key="quantity">Quantity</TableColumn>
                  <TableColumn key="from">From</TableColumn>
                  <TableColumn key="to">To</TableColumn>
                  <TableColumn key="time">Date Time</TableColumn>
                  <TableColumn key="hash">Hash</TableColumn>
                </TableHeader>
                <TableBody
                  items={txsItems}
                  isLoading={txsLoading}
                  loadingContent={<Spinner size="lg" label="Loading..."/>}
                >
                  {(item: any) => (
                    <TableRow key={item['creation_tx']}>
                      {(columnKey) => <TableCell
                        key={`${item['creation_tx']}-${columnKey}`}
                      >
                        {renderTxsCell(item, columnKey)}
                      </TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Tab>
          </Tabs>
        </div>

      </div>
    </div>
  )
}
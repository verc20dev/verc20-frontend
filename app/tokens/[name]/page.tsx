'use client'

import { API_ENDPOINT, BLOCK_EXPLORER_URL } from "@/config/constants";
import useSWR from "swr";
import { notFound, useRouter } from 'next/navigation'
import { Link } from "@nextui-org/link";
import { BackIcon, HammerIcon, SwapArrowIcon } from "@/components/icons";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Progress,
  Table,
  Pagination,
  TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, useDisclosure
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { ArrowRightIcon } from "@nextui-org/shared-icons";
import useScreenSize from "@/hook/screen-size";
import { Tabs, Tab } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import { useCallback, useMemo, useState } from "react";
import { MintTokenModal } from "@/components/mint-modal";
import { TransferTokenModal } from "@/components/transfer-modal";
import { useBlockNumber } from "wagmi";
import CountDownTimer from "@/components/count-down-timer";
import { OfficialBadge, VerifiedBadge } from "@/components/badges";

const shorten = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formPaginationParam = (
  offset: number | undefined,
  limit: number | undefined,
  sort: string | undefined,
  order: string | undefined
): string | undefined => {
  const queryParams: string[] = [];
  if (offset !== undefined) {
    let pageSize = 5;
    if (limit !== undefined) {
      pageSize = limit;
    }
    queryParams.push(`offset=${offset * pageSize}`);
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


export default function TokenDetailPage({params}: { params: { name: string } }) {
  const router = useRouter()
  const screenSize = useScreenSize();

  const [holdersOffset, setHoldersOffset] = useState<number | undefined>();
  const [txsOffset, setTxsOffset] = useState<number | undefined>();


  const {
    isOpen: mintTokenModalOpen,
    onOpen: onMintTokenModalOpen,
    onOpenChange: onMintTokenModalOpenChange
  } = useDisclosure()

  const {
    isOpen: transferTokenModalOpen,
    onOpen: onTransferTokenModalOpen,
    onOpenChange: onTransferTokenModalOpenChange
  } = useDisclosure()

  const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) {
      throw new Error()
    }
    return r.json()
  })
  const {
    data: tokenData,
    error: tokenDataErr,
    isLoading: tokenLoading,
    isValidating
  } = useSWR(`${API_ENDPOINT}/tokens/${params.name}`, fetcher)

  // request holders
  const holdersEp = `${API_ENDPOINT}/tokens/${params.name}/holders`
  const holdersQueryParam = formPaginationParam(holdersOffset, 5, undefined, undefined)
  let holdersEpWithParam = holdersEp
  if (holdersQueryParam !== undefined) {
    holdersEpWithParam = `${holdersEpWithParam}?${holdersQueryParam}`
  }
  const {data: holdersData, error: holdersErr, isLoading: holdersLoading} = useSWR(holdersEpWithParam, fetcher)

  // request transactions
  const txsEp = `${API_ENDPOINT}/tokens/${params.name}/histories`
  const txsQueryParam = formPaginationParam(txsOffset, 5, undefined, undefined)
  let txsEpWithParam = txsEp
  if (txsQueryParam !== undefined) {
    txsEpWithParam = `${txsEpWithParam}?${txsQueryParam}`
  }
  const {data: txsData, error: txsErr, isLoading: txsLoading} = useSWR(txsEpWithParam, fetcher)

  const txsItems = useMemo(() => {
    if (txsData === undefined) {
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

  const {data: currentBlockData, isError, isLoading} = useBlockNumber({
    watch: true,
  })

  const estimatedTargetTime = useCallback(() => {
    if (tokenData?.duration === undefined && tokenData?.start_block === undefined) {
      return 0
    }
    if (currentBlockData === undefined) {
      return 0
    }

    const startBlock = Number(tokenData.start_block)
    const currentBlock = Number(currentBlockData)

    const now = Date.now()
    if (startBlock > currentBlock) {
      const timeLeft = (startBlock - currentBlock) * 12 * 1000
      return now + timeLeft
    } else {
      const duration = Number(tokenData.duration)
      const endBlock = startBlock + duration
      if (currentBlock > endBlock) {
        return now
      } else {
        const blockLeft = endBlock - currentBlock
        const defaultBlockTimeInSecond = 12
        const timeLeft = blockLeft * defaultBlockTimeInSecond * 1000
        return now + timeLeft
      }
    }

  }, [currentBlockData, tokenData])


  const isDisplayTimer = useCallback((): boolean => {
    if (tokenData?.duration === undefined && tokenData?.start_block === undefined) {
      return false
    }

    if (tokenData?.duration === undefined && tokenData?.start_block !== undefined) {
      if (currentBlockData === undefined) {
        return false
      }
      return Number(tokenData.start_block) > Number(currentBlockData);
    }
    return true
  }, [currentBlockData, tokenData])

  const getProgress = useCallback((): number => {
    const startBlock = Number(tokenData?.start_block)
    const currentBlock = Number(currentBlockData)

    if (currentBlock < startBlock) {
      const currentTime = Date.now()
      const deployTime = Number(tokenData?.created_at) * 1000
      const timeLeft = (startBlock - currentBlock) * 12 * 1000
      const totalTime = currentTime - deployTime + timeLeft
      return (currentTime - deployTime) / totalTime * 100
    } else {
      const duration = Number(tokenData?.duration)
      const endBlock = startBlock + duration
      if (currentBlock > endBlock) {
        return 100
      } else {
        return (currentBlock - startBlock) / duration * 100
      }
    }
  }, [currentBlockData, tokenData])

  const getTimerText = useCallback((): string => {
    const startBlock = Number(tokenData?.start_block)
    const currentBlock = Number(currentBlockData)
    if (currentBlock < startBlock) {
      return 'Minting will start in'
    } else {
      return 'Mint ends in'
    }
  }, [currentBlockData, tokenData])

  const mintable = useCallback((): boolean => {
    if (currentBlockData !== undefined && tokenData?.start_block !== undefined) {
      if (tokenData?.start_block > Number(currentBlockData)) {
        return false
      } else {
        if (tokenData?.duration !== undefined) {
          const endBlock = Number(tokenData?.start_block) + Number(tokenData?.duration)
          if (Number(currentBlockData) > endBlock) {
            return false
          }
        }
      }
    }
    return true
  }, [currentBlockData, tokenData])


  const renderHoldersCell = useCallback((item: any, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof any];

    switch (columnKey) {
      case "rank":
        return `#${cellValue}`
      case "address":
        return (
          <Link
            underline="always"
            className="text-sm cursor-pointer"
            href={`/address/${cellValue}`}
          >
            {window.innerWidth < 768 ? shorten(cellValue) : cellValue}
          </Link>
        );
      case "percentage": {
        let progress = Number(item.balance) / Number(tokenData?.total_supply) * 100
        if (tokenData?.type == 'fair') {
          progress = Number(item.balance) / Number(tokenData?.minted) * 100
        }

        return <Progress
          aria-label="progress"
          showValueLabel={true}
          size="sm"
          isStriped
          value={progress}
          classNames={{
            value: "text-xs",
            labelWrapper: "!justify-center",
            base: "!gap-1",
          }}
          formatOptions={{
            maximumFractionDigits: 4,
            style: "percent",
          }}
        />;
      }
      case "quantity":
        return new Intl.NumberFormat('en-US').format(Number(item.balance));
      default:
        return cellValue;
    }
  }, [tokenData]);

  // TODO: fix duplicate histories in backend
  const renderTxsCell = useCallback((item: any, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof any];

    switch (columnKey) {
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

  const renderDeployByText = useCallback(() => {
    let deployByText = tokenData?.created_by
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      deployByText = shorten(tokenData?.created_by)
    }
    return deployByText
  }, [tokenData])

  const renderDeployTxText = useCallback(() => {
    let deployTxText = shorten(tokenData?.creation_tx)
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      deployTxText = tokenData?.creation_tx
    }
    return deployTxText
  }, [tokenData])

  const maxSupplyStr = useMemo(() => {
    if (tokenData === undefined) {
      return '-'
    }
    // check if total supply larger than 0
    if (tokenData.total_supply === "0") {
      return '-'
    }
    return new Intl.NumberFormat('en-US').format(tokenData.total_supply)
  }, [tokenData])

  const typeComponent = useMemo(() => {
    if (tokenData === undefined) {
      return '-'
    }

    const baseClassname = "font-bold px-2 py-0.5 rounded-md"
    let className = baseClassname
    if (tokenData.type === 'fair') {
      className = baseClassname + " bg-green-500 text-black"
    } else {
      className = baseClassname + " bg-default-300"
    }

    return (
      <div className={className}>{tokenData.type}</div>
    )
  }, [tokenData])

  const haveMaxSupply = useMemo(() => {
    if (tokenData === undefined) {
      return false
    }
    return tokenData.total_supply !== "0"
  }, [tokenData])

  // if token not found, redirect to 404
  if (tokenDataErr) {
    return notFound()
  }

  let progress = 0
  if (tokenData) {
    const minted = tokenData['minted']
    const totalSupply = tokenData['total_supply']
    progress = minted / totalSupply * 100
  }


  return (
    <div>
      <Link
        className="cursor-pointer text-sm"
        onPress={() => router.back()}
      >
        <BackIcon/>
        Tokens
      </Link>
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-row items-center justify-center gap-2 mb-4">
            <h1 className="text-5xl font-bold">{tokenData?.name}</h1>
            {tokenData?.isVerified && <VerifiedBadge/>}
            {tokenData?.isOfficial && <OfficialBadge/>}
          </div>
          <Button
            color="primary"
            className="font-bold"
            startContent={<HammerIcon/>}
            onPress={onMintTokenModalOpen}
            isDisabled={!mintable()}
          >
            Mint
          </Button>
          <MintTokenModal
            isOpen={mintTokenModalOpen}
            onOpenChange={onMintTokenModalOpenChange}
            tokenName={tokenData?.name}
            amountLimit={tokenData?.limit}
          />
        </div>
        <div className="flex flex-col gap-4">
          {isDisplayTimer() &&
            <CountDownTimer
              targetDate={estimatedTargetTime()}
              progress={getProgress()}
              text={getTimerText()}
            />
          }
          {haveMaxSupply && <Progress
            aria-label="progress"
            isStriped
            value={progress}
            label="minting progress"
            showValueLabel={true}
            classNames={{
              label: "tracking-wider font-medium text-default-600/60",
              value: "text-foreground/60",
            }}
            formatOptions={{
              maximumFractionDigits: 4,
              style: "percent",
            }}
          />}
        </div>

        <Card className="max-w-full mt-4">
          <CardHeader className="flex gap-3 justify-between">
            <div className="flex flex-col">
              <p className="text-md font-bold">Overview</p>
            </div>
            <div className="flex gap-2 text-sm sm:gap-4">
              <Button
                color="primary"
                startContent={<ArrowRightIcon/>}
                className="font-bold" onPress={onTransferTokenModalOpen}
              >
                Transfer
              </Button>
              <TransferTokenModal
                tokenName={tokenData?.name}
                isOpen={transferTokenModalOpen}
                onOpenChange={onTransferTokenModalOpenChange}
              />
              <Button
                color="primary" startContent={<SwapArrowIcon/>} className="font-bold"
                as={Link} href={`/marketplace/tokens/${params.name}`}
              >
                Trade
              </Button>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody className="gap-4 font-mono">
            <div className="flex justify-between">
              <p className="text-sm">Type</p>
              {typeComponent}
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Max Supply</p>
              <p className="text-sm">{maxSupplyStr}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Decimals</p>
              <p className="text-sm">{tokenData?.decimals}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Minted</p>
              <p className="text-sm">{new Intl.NumberFormat('en-US').format(tokenData?.minted)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Holders</p>
              <p className="text-sm">{new Intl.NumberFormat('en-US').format(tokenData?.holders)}</p>
            </div>
            {tokenData?.start_block &&
              <div className="flex justify-between">
                <p className="text-sm">Mint Start Block</p>
                <Link
                  isExternal
                  showAnchorIcon
                  underline="hover"
                  className="text-sm cursor-pointer"
                  href={`${BLOCK_EXPLORER_URL}/block/${tokenData?.start_block}`}
                >
                  {tokenData?.start_block}
                </Link>
                {/*<p className="text-sm">{new Intl.NumberFormat('en-US').format(tokenData?.start_block)}</p>*/}
              </div>
            }
            {tokenData?.duration &&
              <div className="flex justify-between">
                <p className="text-sm">Mint Duration</p>
                <p className="text-sm">{new Intl.NumberFormat('en-US').format(tokenData?.duration) + ' blocks'}</p>
              </div>
            }
            <div className="flex justify-between">
              <p className="text-sm">Limit Per Mint</p>
              <p
                className="text-sm">{tokenData?.limit ? new Intl.NumberFormat('en-US').format(tokenData.limit) : '-'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Total Transactions</p>
              <p className="text-sm">{new Intl.NumberFormat('en-US').format(tokenData?.transactions)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Deployed Time</p>
              <p className="text-sm">{new Date(tokenData?.created_at * 1000).toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Deployed By</p>
              <Link
                isExternal
                showAnchorIcon
                underline="hover"
                className="text-sm cursor-pointer"
                href={`${BLOCK_EXPLORER_URL}/address/${tokenData?.created_by}`}
              >
                {renderDeployByText()}
              </Link>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Deploy Transaction</p>
              <Link
                isExternal
                showAnchorIcon
                underline="hover"
                className="text-sm cursor-pointer"
                href={`${BLOCK_EXPLORER_URL}/tx/${tokenData?.creation_tx}`}
              >
                {renderDeployTxText()}
              </Link>
            </div>
          </CardBody>
          <Divider/>
          <CardFooter>
          </CardFooter>
        </Card>
      </div>
      <Card className="mt-4">
        <Tabs
          aria-label="Options"
          classNames={{
            base: "w-full justify-center",
          }}
          className="mt-4"
        >
          <Tab key="holders" title="Holders">
            <Table
              aria-label="vERC-20 tokens holders"
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={holdersOffset ? holdersOffset + 1 : 1}
                    total={holdersData?.total}
                    initialPage={1}
                    onChange={(page) => setHoldersOffset(page - 1)}
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
                <TableColumn key="rank" maxWidth={4}>Rank</TableColumn>
                <TableColumn key="address">Address</TableColumn>
                <TableColumn key="percentage">Percentage</TableColumn>
                <TableColumn key="quantity">Quantity</TableColumn>
              </TableHeader>
              <TableBody
                items={holdersData?.data || []}
                isLoading={holdersLoading}
                loadingContent={<Spinner size="lg" label="Loading..."/>}
              >
                {(item: any) => (
                  <TableRow key={item['rank']}>
                    {(columnKey) => <TableCell>{renderHoldersCell(item, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Tab>
          <Tab key="transactions" title="Transactions">
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
      </Card>

    </div>
  );
}
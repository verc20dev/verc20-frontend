'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter, useDisclosure, Tabs, Tab,
  Popover, PopoverTrigger, PopoverContent, Spacer,
} from "@nextui-org/react";
import React, { useCallback, useMemo, useState } from "react";
import { API_ENDPOINT } from "@/config/constants";
import useSWR from "swr";
import { Spinner } from "@nextui-org/spinner";
import { useRouter } from 'next/navigation'
import { Input } from "@nextui-org/input";
import { DeployIcon, FilterIcon, SearchIcon } from "@/components/icons";
import { Button, ButtonGroup } from "@nextui-org/button";
import { DeployTokenModal } from "@/components/deploy-token-modal";
import { useBlockNumber } from "wagmi";
import { SimpleTimer } from "@/components/count-down-timer";
import { of } from "rxjs";
import { OfficialBadge, VerifiedBadge } from "@/components/badges";

const formTokensQueryParam = (
  offset: number | undefined,
  limit: number | undefined,
  sort: string | undefined,
  order: string | undefined
): string | undefined => {
  const queryParams: string[] = [];
  if (offset !== undefined) {
    let pageSize = 10;
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

const fetcher = (url: string) => fetch(url).then(r => r.json())


export default function TokensPage() {

  const router = useRouter()

  const {
    data: currentBlock,
    isError: currentBlockIsError,
    isLoading: currentBlockIsLoading
  } = useBlockNumber({
    watch: true,
  })

  const [offset, setOffset] = useState<number | undefined>(0);
  const [limit, setLimit] = useState<number | undefined>();
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<string | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [tokenNameFilter, setTokenNameFilter] = useState("");
  const [tokenTypeFilter, setTokenTypeFilter] = useState("all");
  const [tokenStatusFilter, setTokenStatusFilter] = useState("all");

  const {
    isOpen: deployTokenModalOpen,
    onOpen: onDeployTokenModalOpen,
    onOpenChange: onDeployTokenModalOpenChange
  } = useDisclosure()

  const listTokensEp = useCallback(() => {
    let ep = `${API_ENDPOINT}/tokens`
    const queries = []
    const queryParam = formTokensQueryParam(offset, limit, sort, order)
    if (queryParam !== undefined) {
      queries.push(queryParam)
    }
    if (tokenNameFilter !== "") {
      queries.push(`tick=${tokenNameFilter}`)
    }
    if (tokenTypeFilter === "fair") {
      queries.push(`type=fair`)
    }
    if (tokenStatusFilter === "progress" || tokenStatusFilter === "completed") {
      queries.push(`status=${tokenStatusFilter}`)
    }
    if (queries.length > 0) {
      ep = `${ep}?${queries.join('&')}`
    }
    return ep
  }, [limit, offset, order, sort, tokenNameFilter, tokenStatusFilter, tokenTypeFilter])

  const {data: res, error, isLoading, isValidating} = useSWR(listTokensEp, fetcher)

  const items: any[] = useMemo((): any[] => {
    if (error) {
      console.log(error)
      return []
    } else if (res && res['data']) {
      setTotalPage(res['total'])
      return res['data'].map((item: any, index: number) => {
        const deployTime = new Date(item['created_at'] * 1000)
        const minted = item['minted']
        const totalSupply = item['total_supply']
        const progress = minted / totalSupply * 100
        const progressStr = progress.toFixed(4)
        const numberFormatter = new Intl.NumberFormat('en-US')

        let resProgress: any = {
          mint: progressStr,
        }

        let target = {
          id: index,
          tick: item['name'],
          deployTime: deployTime.toLocaleString(),
          progress: resProgress,
          holders: item['holders'],
          transactions: item['transactions'],
          isVerified: item['isVerified'],
          isOfficial: item['isOfficial'],
          haveMaxSupply: totalSupply !== undefined && totalSupply > 0,
        }

        if ((item['start_block'] != undefined || item['duration'] != undefined ) && currentBlock != undefined) {
          const startBlock = item['start_block']
          const duration = item['duration']
          if (item['start_block'] != undefined && startBlock > Number(currentBlock)) {
            const currentTime = Date.now()
            const deployedTime = Number(item['created_at']) * 1000
            const timeLeftInSec = (startBlock - Number(currentBlock)) * 12

            const totalTime = currentTime - deployedTime + timeLeftInSec * 1000
            const progress = (currentTime - deployedTime) / totalTime * 100

            target.progress = {
              mint: target.progress.mint,
              time: progress,
              timeLeft: timeLeftInSec,
              started: false
            }


          } else if (item['start_block'] != undefined && item['duration'] != undefined ) {
            const endBlock = startBlock + duration
            let mintTimeProgress = (Number(currentBlock) - startBlock) / (endBlock - startBlock) * 100
            let mintTimeLeft = (endBlock - Number(currentBlock)) * 12
            if (mintTimeProgress > 100) {
              mintTimeProgress = 100
              mintTimeLeft = -1
            }

            target.progress = {
              mint: target.progress.mint,
              time: mintTimeProgress,
              timeLeft: mintTimeLeft,
              started: true
            }
          }
        }
        return target
      })
    } else {
      return []
    }
  }, [currentBlock, error, res])

  const itemsMapping = useMemo(() => {
    if (items === undefined || items.length === 0) {
      return {}
    }
    // create name->item mapping
    const mapping: any = {}
    items.forEach((item: any) => {
      mapping[item.tick] = item
    })
    return mapping
  }, [items])

  const tokenIsVerified = useCallback((tick: string) => {
    if (itemsMapping[tick] === undefined) {
      return false
    }
    return itemsMapping[tick].isVerified
  }, [itemsMapping])

  const tokenIsOfficial = useCallback((tick: string) => {
    if (itemsMapping[tick] === undefined) {
      return false
    }
    return itemsMapping[tick].isOfficial
  }, [itemsMapping])

  const renderCell = useCallback((user: any, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof any];

    switch (columnKey) {
      case "tick":
        return (
          <div className="flex gap-2 items-center w-[250px] justify-center">
            <span className="font-bold text-2xl font-sans-mono">{cellValue}</span>
            {tokenIsVerified(cellValue) && <VerifiedBadge/>}
            {tokenIsOfficial(cellValue) && <OfficialBadge/>}
          </div>
        )
      case "progress":
        let timeProgressBar = <></>
        if (cellValue.time !== undefined) {
          let color: any = "secondary"
          let progressLabel = "Mint starts in:"
          if (cellValue.started) {
            progressLabel = "Mint ends in:"
          }

          let labelWrapperClassname = ""
          if (cellValue.time >= 100) {
            progressLabel = "Mint Time Up"
            // labelWrapperClassname = "!justify-center"
            color = "success"
          }
          timeProgressBar = (
            <>
              <Progress
                aria-label="progress"
                showValueLabel={true}
                size="sm"
                isStriped
                color={color}
                label={progressLabel}
                valueLabel={<SimpleTimer targetDate={Date.now() + cellValue.timeLeft * 1000}/>}
                value={cellValue.time}
                classNames={{
                  label: "text-xs",
                  value: "text-xs",
                  labelWrapper: labelWrapperClassname,
                  base: "!gap-0",
                }}
                formatOptions={{
                  maximumFractionDigits: 4,
                  style: "percent",
                }}
              />
            </>
          )
        }

        return <div className="flex flex-col gap-2">
          {timeProgressBar}
          {user.haveMaxSupply && <Progress
            aria-label="progress"
            showValueLabel={true}
            size="sm"
            isStriped
            label={"Minted:"}
            value={cellValue.mint}
            classNames={{
              label: "text-xs",
              value: "text-xs",
              // labelWrapper: "!justify-center",
              base: "!gap-0",
            }}
            formatOptions={{
              maximumFractionDigits: 4,
              style: "percent",
            }}
          />}
        </div>;
      case "holders":
      case "transactions":
        return new Intl.NumberFormat('en-US').format(Number(cellValue));
      default:
        return cellValue;
    }
  }, [tokenIsOfficial, tokenIsVerified]);

  const tokenTableTopContent = useMemo(() => {
    return (
      <div className="flex flex-col-reverse justify-between gap-3 items-end sm:flex-row">

        <div className="flex justify-between gap-3 items-end w-full sm:w-auto">
          <div className="flex gap-2 items-center w-full">
            <Input
              isClearable
              // className={"hidden sm:block"}
              classNames={{
                // base: "max-w-[50%] sm:max-w-[22%]",
                inputWrapper: "border-1",
              }}
              fullWidth={true}
              placeholder="Search by tick..."
              size="sm"
              startContent={<SearchIcon className="text-default-300"/>}
              variant="bordered"
              value={tokenNameFilter}
              onClear={() => setTokenNameFilter("")}
              onValueChange={setTokenNameFilter}
            />
            <div className="hidden sm:block">
              <Popover
                placement="bottom"
                showArrow={true}
              >
                <PopoverTrigger>
                  <Button
                    size="lg"
                    isIconOnly={true}
                  >
                    <FilterIcon/>
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex flex-col gap-2 items-center font-mono p-4">
                    <div className="flex flex-row justify-start items-center w-full gap-4">
                      <p className="text-lg w-24 text-end">Type:</p>
                      <Tabs
                        color={"success"}
                        aria-label="filter tab"
                        radius="md"
                        size="lg"
                        selectedKey={tokenTypeFilter}
                        onSelectionChange={(selection) => {
                          setTokenTypeFilter(selection.toString())
                        }}
                      >
                        <Tab key="all" title="All"/>
                        <Tab key="fair" title="Fairmint"/>
                      </Tabs>
                    </div>
                    <div className="flex flex-row justify-start items-center w-full gap-4">
                      <p className="text-lg w-24 text-end">Progress:</p>
                      <Tabs
                        color={"success"}
                        aria-label="filter tab"
                        radius="md"
                        size="lg"
                        selectedKey={tokenStatusFilter}
                        onSelectionChange={(selection) => {
                          setTokenStatusFilter(selection.toString())
                        }}
                      >
                        <Tab key="all" title="All"/>
                        <Tab key="progress" title="In-Progress"/>
                        <Tab key="completed" title="Completed"/>
                      </Tabs>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>


          </div>

        </div>
        <div className="flex flex-row gap-2 justify-between w-full sm:w-auto">
          <div className="block sm:hidden">
            <Popover placement="bottom">
              <PopoverTrigger>
                <Button
                  size="lg"
                  isIconOnly={true}
                  startContent={<FilterIcon/>}
                >
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-2 items-center font-mono p-4">
                  <div className="flex flex-col sm:flex-row justify-start  sm:items-center w-full sm:gap-4">
                    <p className="text-lg sm:w-24 sm:text-end">Type:</p>
                    <Tabs key={"success"} color={"success"} aria-label="filter tab" radius="md" size="lg">
                      <Tab key="all" title="All"/>
                      <Tab key="fair" title="Fairmint"/>
                    </Tabs>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-start  sm:items-center w-full sm:gap-4">
                    <p className="text-lg sm:w-24 sm:text-end">Progress:</p>
                    <Tabs key={"success"} color={"success"} aria-label="filter tab" radius="md" size="lg">
                      <Tab key="all" title="All"/>
                      <Tab key="progress" title="In-Progress"/>
                      <Tab key="completed" title="Completed"/>
                    </Tabs>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            color="primary"
            size="lg"
            className="font-bold max-w-fit"
            startContent={<DeployIcon/>}
            onPress={onDeployTokenModalOpen}
          >
            Deploy
          </Button>
        </div>

        <DeployTokenModal isOpen={deployTokenModalOpen} onOpenChange={onDeployTokenModalOpenChange}/>
      </div>
    )
  }, [
    deployTokenModalOpen, onDeployTokenModalOpen, onDeployTokenModalOpenChange, tokenNameFilter,
    tokenStatusFilter, tokenTypeFilter
  ])


  return (
    <div>
      <h1 className="text-3xl font-bold">Tokens</h1>
      <div className="w-full pt-8">
        <Table
          isStriped
          aria-label="vERC-20 tokens"
          topContent={tokenTableTopContent}
          topContentPlacement="outside"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={currentPage}
                total={totalPage}
                initialPage={1}
                onChange={(page) => {
                  setOffset(page - 1)
                  setCurrentPage(page)
                }}
              />
            </div>
          }
          classNames={{
            wrapper: "min-h-[770px]",
            th: "text-center",
            // td: "text-center",
            td: [
              "text-center",
            ],
          }}
          className="font-mono"
          selectionMode="single"
          onRowAction={(key) => router.push(`/tokens/${key}`)}
        >
          <TableHeader>
            <TableColumn key="tick">Tick</TableColumn>
            <TableColumn key="deployTime">Deploy Time</TableColumn>
            <TableColumn key="progress">Progress</TableColumn>
            <TableColumn key="holders">Holders</TableColumn>
            <TableColumn key="transactions">Transactions</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            isLoading={isLoading || isValidating}
            loadingContent={<Spinner size="lg" label="Loading..."/>}
          >
            {(item: any) => (
              <TableRow key={item['tick']} className="cursor-pointer h-[64px]">
                {(columnKey) =>
                  <TableCell className={columnKey === 'tick' ? 'w-[250px]' : ''}>
                    {renderCell(item, columnKey)}
                  </TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
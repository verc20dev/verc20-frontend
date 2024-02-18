'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button } from "@nextui-org/button";
import CreateOrderModal from "@/components/create-order-modal";
import {
  Card, Tab, Tabs, useDisclosure, Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell, Pagination, SortDescriptor
} from "@nextui-org/react";
import { Link } from "@nextui-org/link";
import { BackIcon, EthereumIcon, SearchIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { API_ENDPOINT, ETH_PRICE_ENDPOINT } from "@/config/constants";
import useSWR from "swr";
import { formatEther, parseEther } from "viem";
import { OfficialBadge, VerifiedBadge } from "@/components/badges";
import { getBigInt } from "ethers";

const formQueryParam = (
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


const MarketplacePage = () => {
  const router = useRouter()


  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "",
    direction: "descending",
  });


  const [offset, setOffset] = useState<number | undefined>(0);
  const [limit, setLimit] = useState<number | undefined>();
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<string | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [filterSelected, setFilterSelected] = useState<string>("trending");
  const [tokenNameFilter, setTokenNameFilter] = useState<string>("");


  const listMarketTokenEp = useCallback(() => {
    let ep = `${API_ENDPOINT}/market/tokens`
    const queries = []
    const queryParam = formQueryParam(offset, limit, sort, order)
    if (queryParam !== undefined) {
      queries.push(queryParam)
    }
    if (filterSelected === 'trending') {
      queries.push('trending=true')
    }
    if (tokenNameFilter !== '') {
      queries.push(`tick=${tokenNameFilter}`)
    }
    if (queries.length > 0) {
      ep = `${ep}?${queries.join('&')}`
    }
    return ep;
  }, [filterSelected, limit, offset, order, sort, tokenNameFilter])

  const {
    data: marketTokensData,
    error: marketTokensError,
    isLoading: marketTokensIsLoading,
    isValidating: marketTokensIsValidating
  } = useSWR(listMarketTokenEp(), fetcher)

  const items = useMemo(() => {
    if (marketTokensIsLoading || marketTokensIsValidating) {
      return []
    }

    if (marketTokensError) {
      return []
    }

    if (marketTokensData !== undefined) {
      if (marketTokensData['total'] !== undefined) {
        setTotalPage(marketTokensData['total'])
      }
      if (marketTokensData['data'] !== undefined) {
        return marketTokensData['data'].map((token: any) => ({
          tick: token.tick,
          totalVolume: token.totalVolume,
          dailyVolume: token.dailyVolume,
          floorPrice: token.floorPrice,
          holders: token.holders,
          isVerified: token.isVerified,
          isOfficial: token.isOfficial,
        }))
      }
    }
    return []
  }, [marketTokensData, marketTokensError, marketTokensIsLoading, marketTokensIsValidating])

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

  console.log(items)

  const renderCell = useCallback((item: any, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof any];
    switch (columnKey) {
      case 'tick':
        return (
          <div className="flex gap-2 items-center w-[250px] justify-center">
            <span className="font-bold text-2xl font-sans-mono">{cellValue}</span>
            { tokenIsVerified(cellValue) && <VerifiedBadge/> }
            { tokenIsOfficial(cellValue) && <OfficialBadge/> }
          </div>
        )
      case 'totalVolume':
      case 'dailyVolume':
      case 'floorPrice':
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

          return (
            <div className="flex flex-row gap-2 w-full justify-center items-center">
              <EthereumIcon/>
              <span>{tvlInEthString}</span>
            </div>
          )
        }
      case 'holders':
        return new Intl.NumberFormat('en-US').format(cellValue)
      default:
        return cellValue;
    }
  }, [tokenIsOfficial, tokenIsVerified])

  const pagination = useMemo(() => {
    if (filterSelected === 'trending') {
      return <div></div>
    }
    return <div className="flex w-full justify-center">
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
  }, [currentPage, filterSelected, totalPage])


  return (
    <div>
      <h1 className="text-3xl font-bold">Marketplace</h1>

      <div className="flex flex-col mt-8 w-full gap-3">
        <div className="flex font-mono gap-4 flex-col items-center sm:flex-row sm:justify-between ">
          <div>
            <Tabs
              key={"success"} color={"success"}
              aria-label="filter tab" radius="md" size="lg"
              selectedKey={filterSelected}
              onSelectionChange={(key) => {
                if (key.toString() === 'trending') {
                  setOffset(0)
                  setCurrentPage(1)
                }
                setFilterSelected(key.toString())
              }}
            >
              <Tab key="trending" title="Trending"/>
              <Tab key="all" title="All"/>
            </Tabs>
          </div>
          <div>
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
          </div>
        </div>
        <div>
          <Table
            isStriped
            aria-label="Marketplace Table"
            bottomContent={pagination}
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
            onRowAction={(key) => router.push(`/marketplace/tokens/${key}`)}
            sortDescriptor={sortDescriptor}
            onSortChange={(sortDescriptor) => {
              setSortDescriptor(sortDescriptor)
              const toSnakeCase = (str: string | undefined) => {
                if (str === undefined) {
                  return ''
                }
                return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
              }
              setSort(toSnakeCase(sortDescriptor.column?.toString()))
              if (sortDescriptor.direction === undefined) {
                setOrder(undefined)
                return
              } else if (sortDescriptor.direction === 'ascending') {
                setOrder('asc')
              } else if (sortDescriptor.direction === 'descending') {
                setOrder('desc')
              }
            }}
          >
            <TableHeader>
              <TableColumn key="tick" className="w-[250px]">Tick</TableColumn>
              <TableColumn key="totalVolume" allowsSorting>Total Volume</TableColumn>
              <TableColumn key="dailyVolume" allowsSorting>24H Volume</TableColumn>
              <TableColumn key="floorPrice" allowsSorting>Floor Price</TableColumn>
              <TableColumn key="holders">Holders</TableColumn>
            </TableHeader>
            <TableBody
              items={items}
              isLoading={marketTokensIsLoading || marketTokensIsValidating}
              // isLoading={true}
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

    </div>
  );
};

export default MarketplacePage;
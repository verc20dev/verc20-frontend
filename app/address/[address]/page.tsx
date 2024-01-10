'use client'

import { Link } from "@nextui-org/link";
import { BackIcon, OutSiteIcon, SearchIcon } from "@/components/icons";
import { notFound, useRouter } from "next/navigation";
import { Tooltip, Tabs, Tab, Chip, Card, Pagination } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { enqueueSnackbar } from "notistack";
import { HoldingCard } from "@/components/holding-card";
import { OfficialBadge, OGBadge, VerifiedBadge } from "@/components/badges";
import { Input } from "@nextui-org/input";
import { useState } from "react";
import { BlockiesAvatar } from "@/components/blockies-avatar";
import { API_ENDPOINT } from "@/config/constants";
import useSWR from "swr";
import { Spinner } from "@nextui-org/spinner";
import { useEthersSigner } from "@/hook/ethers";

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
  let items = []
  if (error) {
    enqueueSnackbar('Error while fetching balance data', {variant: 'error'})
    console.log(error)
  }

  if (data?.tokens) {
    items = data.tokens.map((token: any) => ({
      name: token.name,
      balance: token.balance,
    }))
  }


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
            />
          </Tabs>
        </div>

      </div>
    </div>
  )
}
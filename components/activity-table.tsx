import React, { useCallback, useMemo, useState } from 'react';
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import useSWR from "swr";
import { API_ENDPOINT, BLOCK_EXPLORER_URL } from "@/config/constants";
import { useRouter } from "next/navigation";
import { getBigInt } from "ethers";
import { formatEther } from "viem";
import { OutSiteIcon } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";


export interface ActivityTableProps {
  shouldFetch?: boolean;
  tick: string
  ethPrice: string
}

const shorten = (address: string): string => {
  if (address === undefined) return '-'
  // check if address is valid
  if (address.length < 2 || address.length < 8) return address;
  return address.slice(0, 6) + '...' + address.slice(-4)
}

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


const ActivityTable = (props: ActivityTableProps) => {

  const router = useRouter()

  const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) {
      throw new Error()
    }
    return r.json()
  })

  const [offset, setOffset] = useState<number | undefined>(0);
  const [limit, setLimit] = useState<number | undefined>();
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<string | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  let listActivitiesEp = `${API_ENDPOINT}/market/activities?tick=${props.tick}`
  const queryParam = formTokensQueryParam(offset, limit, sort, order)
  if (queryParam !== undefined) {
    listActivitiesEp = `${listActivitiesEp}&${queryParam}`
  }

  const {
    data: activityData,
    error: activityDataErr,
    isLoading: activityLoading,
    isValidating: activityValidating
  } = useSWR(
    props.shouldFetch ? listActivitiesEp : null,
    fetcher
  )

  const items = useMemo(() => {
    if (activityValidating || activityLoading) {
      return []
    }

    if (activityDataErr) {
      return []
    }

    if (!activityData) {
      return []
    }

    if (activityData.data === undefined) {
      return []
    }

    if (activityData.total !== undefined) {
      setTotalPage(activityData.total)
    }

    return activityData.data.map((activity: any) => {
      const unitPriceInEth = Number(formatEther(getBigInt(activity.unit_price)))
      const quantity = activity.quantity
      const totalPriceInEth = unitPriceInEth * Number(quantity)

      return {
        type: activity.type,
        tick: activity.tick,
        quantity: activity.quantity,
        unitPrice: unitPriceInEth,
        totalPrice: totalPriceInEth,
        from: activity.from,
        to: activity.to,
        time: activity.created_at,
        hash: activity.tx
      }
    })

  }, [activityData, activityLoading, activityValidating, activityDataErr])


  const renderCell = useCallback((item: any, columnKey: any) => {
    const cellValue = item[columnKey as keyof any];
    switch (columnKey) {
      case 'type':
        switch (cellValue) {
          case 'Listing':
            return <p className="text-sm text-primary-500">Listing</p>
          case 'Sale':
            return <p className="text-sm text-success-500">Sale</p>
          case 'Cancel':
            return <p className="text-sm text-error-500">Cancel</p>
          default:
            return <p className="text-sm">{cellValue}</p>
        }
      case 'tick':
        return <span className="font-bold text-xl font-sans-mono">{cellValue}</span>
      case 'unitPrice':
      case 'totalPrice':
        return `$${new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 4,
        }).format(Number(cellValue) * Number(props.ethPrice))}`
      case 'quantity':
        return `${new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 10,
        }).format(Number(cellValue))}`;
      case 'from':
      case 'to':
        if (cellValue === undefined) return '-'
        return <Tooltip content={cellValue}>
          <Link
            underline="always"
            color={"foreground"}
            href={`/address/${cellValue}`}
          >
            <p className="text-xs">{shorten(cellValue)}</p>
          </Link>
        </Tooltip>
      case 'time':
        return new Date(cellValue * 1000).toLocaleString()
      case 'hash':
        return <Tooltip content="View on block explorer">
          <Link
            isExternal={true}
            showAnchorIcon
            href={`${BLOCK_EXPLORER_URL}/tx/${cellValue}`}
          />
        </Tooltip>
      default:
        return cellValue
    }
  }, [props.ethPrice])

  const tableCellClassname = (key: string) => {
    switch (key) {
      case 'tick':
        return 'w-[200px]'
      case 'from':
      case 'to':
        return 'w-[120px]'
      case 'quantity':
      case 'unitPrice':
      case 'totalPrice':
        return 'w-[100px] text-xs'
      case 'time':
        return 'text-xs'
      default:
        return ''
    }
  }

  return (
    <div className="w-full">
      <Table
        isStriped
        aria-label="Activities Table"
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
          wrapper: "min-h-[400px]",
          th: "text-center",
          // td: "text-center",
          td: [
            "text-center",
          ],
        }}
        className="font-mono"
        selectionMode="single"
      >
        <TableHeader>
          <TableColumn key="type">Type</TableColumn>
          <TableColumn key="tick">Tick</TableColumn>
          <TableColumn key="quantity">Quantity</TableColumn>
          <TableColumn key="unitPrice">Unit Price</TableColumn>
          <TableColumn key="totalPrice">Total Price</TableColumn>
          <TableColumn key="from">From</TableColumn>
          <TableColumn key="to">To</TableColumn>
          <TableColumn key="time">Time</TableColumn>
          <TableColumn key="hash">Hash</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          isLoading={activityLoading || activityValidating}
          loadingContent={<Spinner size="lg" label="Loading..."/>}
        >
          {(item: any) => (
            <TableRow key={item['hash']} className="h-[40px]">
              {(columnKey) =>
                <TableCell className={tableCellClassname(columnKey.toString())}>
                  {renderCell(item, columnKey)}
                </TableCell>}
            </TableRow>
          )}
        </TableBody>

      </Table>
    </div>
  );
};

export default ActivityTable;
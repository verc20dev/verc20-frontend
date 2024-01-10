import useSWR from "swr";
import React, { useMemo, useState } from 'react';
import { API_ENDPOINT } from "@/config/constants";
import { Spinner } from "@nextui-org/spinner";
import ListingCard from "@/components/listing-card";
import { Pagination } from "@nextui-org/react";


export interface OrderTableProps {
  tick: string
  address: string
  shouldFetch?: boolean
  ethPrice: string
  justSelf?: boolean
}

const formTokensQueryParam = (
  offset: number | undefined,
  limit: number | undefined,
  sort: string | undefined,
  order: string | undefined
): string | undefined => {
  let pageSize = 8;
  const queryParams: string[] = [];
  if (offset !== undefined) {
    if (limit !== undefined) {
      pageSize = limit;
    }
    queryParams.push(`offset=${offset * pageSize}`);
  }

  queryParams.push(`limit=${pageSize}`);
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

const OrderTable = (props: OrderTableProps) => {
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

  let ordersEp = `${API_ENDPOINT}/market/orders?tick=${props.tick}`
  const queryParam = formTokensQueryParam(offset, limit, sort, order)
  if (queryParam !== undefined) {
    ordersEp = `${ordersEp}&${queryParam}`
  }
  if (props.justSelf && props.address !== undefined) {
    ordersEp = `${ordersEp}&owner=${props.address}`
  }

  const {
    data: orderData,
    error: orderDataErr,
    isLoading: orderLoading,
    isValidating: orderValidating,
  } = useSWR(props.shouldFetch ? ordersEp : null, fetcher)

  const orderItems = useMemo(() => {
    if (orderData === undefined) {
      return []
    }

    if (orderData.total !== undefined) {
      setTotalPage(orderData.total)
    }

    if (orderData.data === undefined) {
      return []
    }

    console.log(orderData.data)
    return orderData.data.map((item: any) => {
      return {
        id: item.id,
        tick: item.tick,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        startTime: item.created_at,
        endTime: item.expiration_time,
        owner: item.owner,
        input: item.input,
        signature: item.signature
      }
    })
  }, [orderData])

  return useMemo(() => {
    if (orderLoading || orderValidating) {
      return (
        <div className="flex justify-center items-center h-96">
          <Spinner/>
        </div>
      )
    }

    if (orderDataErr) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-sm text-gray-400">Error while fetching data</p>
        </div>
      )
    }

    if (orderItems.length === 0) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-sm text-gray-400">No order found</p>
        </div>
      )
    }

    return <div className="w-full">
      <div
        className="w-full p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {
          orderItems.map((item: any, index: number) => {
            return (
              <ListingCard
                key={index}
                id={item.id}
                tick={item.tick}
                quantity={item.quantity}
                unitPrice={item.unitPrice}
                startTime={item.startTime * 1000}
                endTime={item.endTime * 1000}
                seller={item.owner}
                ethPrice={props.ethPrice}
                isSelf={props.address === item.owner}
                input={item.input}
                address={props.address}
                signature={item.signature}
              />
            )
          })
        }
      </div>
      <div className="flex w-full justify-center mt-4 mb-4">
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
    </div>


  }, [orderLoading, orderValidating, orderDataErr, orderItems, currentPage, totalPage, props]);
};

export default OrderTable;
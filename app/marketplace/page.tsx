'use client';

import React, { Key, useCallback, useMemo, useState } from 'react';
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


const fetcher = (url: string) => fetch(url).then(r => r.json())


const MarketplacePage = () => {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-3xl font-bold">Marketplace</h1>

      <div className="flex flex-col mt-8 w-full gap-3 h-96 justify-center">
        <div className="hidden sm:flex flex-row items-center font-bold text-lg justify-center mt-8 text-default-500">
          <span>The marketplace will launch upon the completion of&nbsp;&nbsp;</span>
          <div className="flex gap-2 items-center justify-center">
            <Link
              underline="hover"
              className="font-bold text-xl sm:text-2xl font-sans-mono"
              href={`/tokens/vERC`}
            >
              vERC
            </Link>
            <OfficialBadge/>
          </div>
          <span>&nbsp;minting.</span>
        </div>
        <span className="sm:hidden font-bold text-lg text-center mt-8 text-default-500">The marketplace will launch upon the completion of&nbsp;&nbsp;
          <span>
            <Link
              underline="hover"
              className="font-bold text-xl sm:text-2xl font-sans-mono"
              href={`/tokens/vERC`}
            >
              vERC
            </Link>
          </span>

          <span>&nbsp;&nbsp;minting.</span></span>
      </div>

    </div>
  );
};

export default MarketplacePage;
'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useBlockNumber } from "wagmi";
import { API_ENDPOINT } from "@/config/constants";
import useSWR from "swr";
import { Tooltip } from "@nextui-org/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json())


const SyncStatusBar = () => {
  const {
    data: currentBlock,
    isError: isBlockChainDown,
    isLoading: isCurrentBlockLoading
  } = useBlockNumber({
    watch: true,
  })

  const indexerStatusEp = `${API_ENDPOINT}/status`
  const {
    data: indexerStatus,
    error: indexerStatusError,
    isLoading: isIndexerStatusLoading,
    isValidating: isIndexerStatusValidating
  } = useSWR(indexerStatusEp, fetcher, {refreshInterval: 1000})

  const [synced, setSynced] = useState(true)

  useEffect(() => {
    const importedBlock = indexerStatus?.latest_imported_block_number
    if (Number(currentBlock) > Number(importedBlock)) {
      setSynced(false)
    } else {
      setSynced(true)
    }
  }, [currentBlock, indexerStatus]);

  const statusDot = useMemo(() => {
    if (synced) {
      return (
        <Tooltip content="index is up to date" placement="right" color="success">
          <div className="w-4 h-4">
            <div className="relative w-full h-full font-mono">
              <div className="absolute inset-0 rounded-full bg-green-500 opacity-75 "></div>
              <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-ping"></div>
            </div>
          </div>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip content={`${Number(currentBlock) - Number(indexerStatus?.latest_imported_block_number)} blocks behind, indexing...`} placement="right" color="success">
          <div className="w-4 h-4">
            <div className="relative w-full h-full font-mono">
              <div className="absolute inset-1 rounded-full bg-green-500 opacity-75 animate-pulse"></div>
              <div className="absolute inset-0 border-t-2 border-green-500 rounded-full animate-spin"></div>
            </div>
          </div>
        </Tooltip>
      )
    }

  }, [currentBlock, indexerStatus, synced])


  return (
    <div>
      {statusDot}
    </div>
  );
};

export default SyncStatusBar;
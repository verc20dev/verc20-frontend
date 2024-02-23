import { encode } from 'cbor-x';

const CBOR_TAG = 'd9d9f7'

const toCbor = (payload: any) => {
  const cborEncoded = encode(payload)
  return `0x${CBOR_TAG}${Buffer.from(cborEncoded).toString('hex')}`
}

let defaultPayload = {
  p: 'verc-20',
}

export interface DeployInput {
  tick: string
  totalSupply: string
  decimals?: string
  limit?: string
  startBlock?: string
  duration?: string
  type?: string
}

export interface MintInput {
  tick: string
  amount: string
}

export interface TransferInput {
  tick: string
  amount: string
}

export interface ListInput {
  tick: string
  amount: string
}


export function formDeployInput(input: DeployInput) {

  const payload: any = {
    ...defaultPayload,
    op: 'deploy',
    tick: input.tick,
  }

  if (
    input.totalSupply !== undefined &&
    input.totalSupply !== null &&
    input.totalSupply !== ''
  ) {
    payload['max'] = input.totalSupply
  }

  if (
    input.decimals !== undefined &&
    input.decimals !== null &&
    input.decimals !== '' &&
    input.decimals !== '18'
  ) {
    payload['dec'] = input.decimals
  }

  if (
    input.limit !== undefined &&
    input.limit !== null &&
    input.limit !== ''
  ) {
    payload['lim'] = input.limit
  }

  if (
    input.startBlock !== undefined &&
    input.startBlock !== null &&
    input.startBlock !== ''
  ) {
    payload['startBlock'] = input.startBlock
  }

  if (
    input.duration !== undefined &&
    input.duration !== null &&
    input.duration !== ''
  ) {
    payload['duration'] = input.duration
  }

  if (
    input.type !== undefined &&
    input.type !== null &&
    input.type !== ''
  ) {
    payload['t'] = input.type
  }

  return toCbor(payload)
}

export function formMintInput(input: MintInput) {
  const payload: any = {
    ...defaultPayload,
    op: 'mint',
    tick: input.tick,
    amt: input.amount,
  }

  return toCbor(payload)
}

export function formTransferInput(input: TransferInput) {
  const payload: any = {
    ...defaultPayload,
    op: 'transfer',
    tick: input.tick,
    amt: input.amount,
  }

  return toCbor(payload)
}

export function formListInput(input: ListInput) {
  const payload: any = {
    ...defaultPayload,
    op: 'list',
    tick: input.tick,
    amt: input.amount,
  }

  return toCbor(payload)
}



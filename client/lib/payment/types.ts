/**
 * X402 Payment Protocol Types (ERC-3009)
 * Ported from unified-webapp for voice session gating.
 */

export interface TransferWithAuthorization {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface X402ExactPayload {
  authorization: TransferWithAuthorization;
  signature: string;
}

export interface X402PaymentPayload {
  x402Version: number;
  scheme: 'exact';
  network: string;
  payload: X402ExactPayload;
}

export type X402PaymentHeader = string;

export interface TypedData {
  domain: EIP712Domain;
  types: {
    EIP712Domain: ReadonlyArray<{ readonly name: string; readonly type: string }>;
    TransferWithAuthorization: ReadonlyArray<{ readonly name: string; readonly type: string }>;
  };
  primaryType: 'TransferWithAuthorization';
  message: TransferWithAuthorization;
}

export const ERC3009_TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

export const X402_VERSION = 1;
export const DEFAULT_VALID_DURATION_SECONDS = 3600;

export interface BuildPaymentHeaderParams {
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  network: string;
  chainId: number;
  userAddress: string;
  validDuration?: number;
}

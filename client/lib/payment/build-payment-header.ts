/**
 * X402 Payment Header Builder
 * Ported from unified-webapp for voice session gating.
 */
import type {
  BuildPaymentHeaderParams,
  EIP712Domain,
  TransferWithAuthorization,
  TypedData,
  X402PaymentHeader,
  X402PaymentPayload,
} from './types';
import { DEFAULT_VALID_DURATION_SECONDS, ERC3009_TYPES, X402_VERSION } from './types';

const USDC_DECIMALS = 6;

export function parseTokenAmount(amount: string, decimals: number = USDC_DECIMALS): string {
  const amountFloat = parseFloat(amount);
  if (Number.isNaN(amountFloat)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  const multiplier = Math.pow(10, decimals);
  const amountInSmallestUnit = Math.floor(amountFloat * multiplier);
  return amountInSmallestUnit.toString();
}

export function generateNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}`;
}

export function getTokenDomain(tokenAddress: string, chainId: number): EIP712Domain {
  return {
    name: 'USD Coin',
    version: '2',
    chainId: chainId,
    verifyingContract: tokenAddress,
  };
}

export function buildPaymentTypedData(params: BuildPaymentHeaderParams): TypedData {
  const {
    tokenAddress,
    recipientAddress,
    amount,
    chainId,
    userAddress,
    validDuration = DEFAULT_VALID_DURATION_SECONDS,
  } = params;

  const nonce = generateNonce();
  const now = Math.floor(Date.now() / 1000);
  const validAfter = now.toString();
  const validBefore = (now + validDuration).toString();
  const valueInSmallestUnit = parseTokenAmount(amount, USDC_DECIMALS);

  const authorization: TransferWithAuthorization = {
    from: userAddress,
    to: recipientAddress,
    value: valueInSmallestUnit,
    validAfter,
    validBefore,
    nonce,
  };

  const domain = getTokenDomain(tokenAddress, chainId);

  return {
    domain,
    types: ERC3009_TYPES,
    primaryType: 'TransferWithAuthorization',
    message: authorization,
  };
}

export function encodePaymentHeader(
  authorization: TransferWithAuthorization,
  signature: string,
  network: string
): X402PaymentHeader {
  const payload: X402PaymentPayload = {
    x402Version: X402_VERSION,
    scheme: 'exact',
    network: network,
    payload: { authorization, signature },
  };
  return btoa(JSON.stringify(payload));
}

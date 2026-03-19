export { buildPaymentTypedData, encodePaymentHeader, parseTokenAmount, generateNonce } from './build-payment-header';
export type { X402PaymentHeader, BuildPaymentHeaderParams, TypedData } from './types';
export { ERC3009_TYPES, X402_VERSION, DEFAULT_VALID_DURATION_SECONDS } from './types';

// Intermediary address for Base -> Base (OnchainFi)
const INTERMEDIARY_BY_NETWORK_PAIR: Record<string, string> = {
  'base->base': '0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1',
};

export function resolveIntermediaryAddress(network: string, override?: string | null): string {
  if (override?.trim()) return override.trim();
  const pair = `${network}->${network}`;
  return INTERMEDIARY_BY_NETWORK_PAIR[pair] ?? '0x0000000000000000000000000000000000000000';
}

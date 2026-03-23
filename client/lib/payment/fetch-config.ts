/**
 * Fetch x402 payment configuration from the server.
 *
 * Returns the payTo address, network, token contract, and EIP-712 domain
 * params so the client signs payments to the correct recipient.
 */

const API_URL = process.env.NEXT_PUBLIC_DELVE_API_URL ?? '';

export interface ServerPaymentConfig {
  payTo: string;
  network: string;
  scheme: string;
  asset: string;
  token: string;
  maxTimeoutSeconds: number;
  extra: {
    assetTransferMethod: string;
    name: string;
    version: string;
  };
}

let cachedConfig: ServerPaymentConfig | null = null;

export async function fetchPaymentConfig(): Promise<ServerPaymentConfig> {
  if (cachedConfig) return cachedConfig;

  const response = await fetch(`${API_URL}/payment/config`);
  if (!response.ok) {
    throw new Error(`Failed to fetch payment config: ${response.status}`);
  }

  cachedConfig = (await response.json()) as ServerPaymentConfig;
  return cachedConfig;
}

'use client';

/**
 * useVoiceSession — manages the paid voice session flow.
 *
 * State machine:
 *   DISCONNECTED → WALLET_CONNECTED → SIGNING → PAYMENT_PENDING → SESSION_READY → IN_SESSION → ENDED
 */
import { buildPaymentTypedData, encodePaymentHeader, fetchPaymentConfig } from '@/lib/payment';
import type { X402PaymentHeader } from '@/lib/payment';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useCallback, useState } from 'react';
import type { SignTypedDataParameters } from 'viem';
import { useSignTypedData } from 'wagmi';

export type VoiceSessionStep =
  | 'DISCONNECTED'
  | 'WALLET_CONNECTED'
  | 'SIGNING'
  | 'PAYMENT_PENDING'
  | 'SESSION_READY'
  | 'IN_SESSION'
  | 'ENDED'
  | 'ERROR';

interface VoiceSessionResult {
  session_token: string;
  expires_in: number;
  tx_hash: string;
}

// Payment configuration from env (used as fallback if server config fetch fails)
const DELVE_API_URL = process.env.NEXT_PUBLIC_DELVE_API_URL ?? '';
const PAYMENT_AGENT_ID = process.env.NEXT_PUBLIC_PAYMENT_AGENT_ID ?? '';

const FALLBACK_CONFIG = {
  tokenAddress: process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS ?? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  recipientAddress: process.env.NEXT_PUBLIC_ONCHAINFI_INTERMEDIARY_ADDRESS ?? '',
  network: process.env.NEXT_PUBLIC_PAYMENT_NETWORK ?? 'base',
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '8453', 10),
  amount: process.env.NEXT_PUBLIC_PAYMENT_DEFAULT_AMOUNT ?? '1.00',
};

export interface UseVoiceSessionReturn {
  step: VoiceSessionStep;
  error: string | null;
  sessionToken: string | null;
  txHash: string | null;
  connectWallet: () => void;
  startPayment: () => Promise<void>;
  reset: () => void;
  isLoading: boolean;
}

export function useVoiceSession(): UseVoiceSessionReturn {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const [step, setStep] = useState<VoiceSessionStep>('DISCONNECTED');
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const connectWallet = useCallback(() => {
    if (isConnected) {
      setStep('WALLET_CONNECTED');
      return;
    }
    open();
  }, [isConnected, open]);

  // Watch for wallet connection state changes
  // (handled by the component observing isConnected)

  const startPayment = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first.');
      return;
    }

    try {
      setError(null);

      // Step 1: Fetch payment config from server
      setStep('SIGNING');
      let recipientAddress = FALLBACK_CONFIG.recipientAddress;
      let tokenAddress = FALLBACK_CONFIG.tokenAddress;
      let network = FALLBACK_CONFIG.network;
      try {
        const serverConfig = await fetchPaymentConfig();
        recipientAddress = serverConfig.payTo;
        tokenAddress = serverConfig.asset || tokenAddress;
        network = serverConfig.network || network;
      } catch (fetchErr) {
        console.warn('Failed to fetch payment config from server, using fallback:', fetchErr);
      }

      // Step 2: Sign EIP-712 payment authorization
      const typedData = buildPaymentTypedData({
        tokenAddress,
        recipientAddress,
        amount: FALLBACK_CONFIG.amount,
        network,
        chainId: FALLBACK_CONFIG.chainId,
        userAddress: address,
      });

      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      } as unknown as SignTypedDataParameters);

      const paymentHeader: X402PaymentHeader = encodePaymentHeader(
        typedData.message,
        signature,
        network
      );

      // Step 3: Send to Delve for verification + settlement
      setStep('PAYMENT_PENDING');
      const response = await fetch(`${DELVE_API_URL}/paid/voice/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_header: paymentHeader,
          agent_id: PAYMENT_AGENT_ID,
          expected_amount: FALLBACK_CONFIG.amount,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(body.detail || `Payment failed (${response.status})`);
      }

      const result: VoiceSessionResult = await response.json();

      if (!result.session_token) {
        throw new Error('No session token in payment response');
      }

      setSessionToken(result.session_token);
      setTxHash(result.tx_hash ?? null);
      setStep('SESSION_READY');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      // User rejected the signature — go back to connected state
      if (message.includes('rejected') || message.includes('denied') || message.includes('cancelled')) {
        setStep('WALLET_CONNECTED');
        setError(null);
      } else {
        setStep('ERROR');
        setError(message);
      }
    }
  }, [isConnected, address, signTypedDataAsync]);

  const reset = useCallback(() => {
    setStep(isConnected ? 'WALLET_CONNECTED' : 'DISCONNECTED');
    setError(null);
    setSessionToken(null);
    setTxHash(null);
  }, [isConnected]);

  const isLoading = step === 'SIGNING' || step === 'PAYMENT_PENDING';

  return {
    step,
    error,
    sessionToken,
    txHash,
    connectWallet,
    startPayment,
    reset,
    isLoading,
  };
}

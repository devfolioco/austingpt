import crypto from 'crypto';
import { jwtVerify } from 'jose';
import { AccessToken, AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// Voice session JWT gate — if set, requires a valid session token from Delve
const VOICE_SESSION_JWT_SECRET = process.env.VOICE_SESSION_JWT_SECRET;

// Single-use JTI enforcement: consumed tokens cannot be replayed
const consumedJtis = new Set<string>();

// Periodically clear consumed JTIs to prevent unbounded memory growth
const JTI_CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
setInterval(() => {
  consumedJtis.clear();
}, JTI_CLEANUP_INTERVAL_MS);

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- x402 Session Gate ---
    if (VOICE_SESSION_JWT_SECRET) {
      const sessionToken =
        searchParams.get('session_token') ||
        request.headers.get('authorization')?.replace('Bearer ', '');

      if (!sessionToken) {
        return NextResponse.json(
          { error: 'Payment required', detail: 'A valid session_token is required to access this voice agent.' },
          { status: 402 }
        );
      }

      try {
        const secret = new TextEncoder().encode(VOICE_SESSION_JWT_SECRET);
        const { payload } = await jwtVerify(sessionToken, secret, { algorithms: ['HS256'] });

        if (payload.session_type !== 'voice') {
          return NextResponse.json({ error: 'Invalid token', detail: 'Token is not a voice session token.' }, { status: 401 });
        }

        const jti = payload.jti;
        if (!jti) {
          return NextResponse.json({ error: 'Invalid token', detail: 'Token missing jti claim.' }, { status: 401 });
        }

        if (consumedJtis.has(jti)) {
          return NextResponse.json(
            { error: 'Token already used', detail: 'This session token has already been consumed.' },
            { status: 409 }
          );
        }

        // Mark as consumed (single-use)
        consumedJtis.add(jti);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Token verification failed';
        const isExpired = message.includes('exp');
        return NextResponse.json(
          { error: isExpired ? 'Token expired' : 'Invalid token', detail: message },
          { status: 401 }
        );
      }
    }
    // --- End Gate ---

    const mood = searchParams.get('mood');

    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Generate participant token
    const participantIdentity = `voice_assistant_user_${crypto.randomUUID().replace(/-/g, '')}`;
    const roomName = `${mood}_room_${crypto.randomUUID().replace(/-/g, '')}`;
    const participantToken = await createParticipantToken({ identity: participantIdentity }, roomName);

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName: participantIdentity,
    };
    const headers = new Headers({
      'Cache-Control': 'no-store',
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}

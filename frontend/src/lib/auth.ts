import { cookies } from 'next/headers';
import crypto from 'crypto';

export interface JWTPayload {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  avatar: string | null;
  role: 'customer' | 'admin';
  language: 'en' | 'ta';
  isVerified: boolean;
  createdAt: string;
  exp: number;
}

// Generate signed HS256 JWT tokens
export function signToken(payload: Omit<JWTPayload, 'exp'>, secret: string, expiresInMinutes: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  const fullPayload = { ...payload, exp };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${headerB64}.${payloadB64}`);
  const signatureB64 = hmac.digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// HS256 JWT signature verification using native Node.js crypto
export function verifyToken(token: string, secret: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature using HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${headerB64}.${payloadB64}`);
    const expectedSignature = hmac.digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // Convert to base64url

    if (signatureB64 !== expectedSignature) {
      return null;
    }

    // Decode and parse payload
    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    // Validate expiration
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload as JWTPayload;
  } catch (err) {
    return null;
  }
}

// Get the authenticated session user payload from cookies
export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    
    const secret = process.env.JWT_SECRET || "default_jwt_secret_change_me_in_prod";
    return verifyToken(token, secret);
  } catch (err) {
    return null;
  }
}

// Boolean checks for authentication and administration status
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'admin';
}

// Throw error assertions for securing pages/endpoints
export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return session;
}

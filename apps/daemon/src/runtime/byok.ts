import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

import { eq } from 'drizzle-orm';

import { db } from '../db/client.ts';
import { agentCredentials } from '../db/schema.ts';

type Provider = 'openai' | 'anthropic' | 'custom';

export type PlainCredentials = {
  provider: Provider;
  apiKey: string;
  endpointUrl?: string;
};

export async function getCredentials(agentPk: number): Promise<PlainCredentials> {
  const row = await db.query.agentCredentials.findFirst({
    where: eq(agentCredentials.agentPk, agentPk),
  });

  if (!row) throw new Error(`No BYOK credentials registered for agent ${agentPk}`);

  return {
    provider: row.provider as Provider,
    apiKey: decryptSecret(row.encryptedApiKey),
    endpointUrl: row.encryptedEndpointUrl ? decryptSecret(row.encryptedEndpointUrl) : undefined,
  };
}

export async function saveCredentials(
  agentPk: number,
  credentials: PlainCredentials,
): Promise<void> {
  await db
    .insert(agentCredentials)
    .values({
      agentPk,
      provider: credentials.provider,
      encryptedApiKey: encryptSecret(credentials.apiKey),
      encryptedEndpointUrl: credentials.endpointUrl ? encryptSecret(credentials.endpointUrl) : null,
    })
    .onConflictDoUpdate({
      target: agentCredentials.agentPk,
      set: {
        provider: credentials.provider,
        encryptedApiKey: encryptSecret(credentials.apiKey),
        encryptedEndpointUrl: credentials.endpointUrl
          ? encryptSecret(credentials.endpointUrl)
          : null,
        updatedAt: new Date(),
      },
    });
}

export function encryptCredentials(credentials: PlainCredentials): PlainCredentials {
  return {
    provider: credentials.provider,
    apiKey: encryptSecret(credentials.apiKey),
    endpointUrl: credentials.endpointUrl ? encryptSecret(credentials.endpointUrl) : undefined,
  };
}

export function encryptSecret(plaintext: string): string {
  const key = masterKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecret(payload: string): string {
  const [version, iv, tag, encrypted] = payload.split('.');
  if (version !== 'v1' || !iv || !tag || !encrypted)
    throw new Error('Invalid encrypted secret payload');

  const decipher = createDecipheriv('aes-256-gcm', masterKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function masterKey(): Buffer {
  const raw = process.env.DAEMON_MASTER_KEY;
  if (!raw) throw new Error('DAEMON_MASTER_KEY is required for BYOK credential encryption');

  const decoded = decodeKey(raw);
  if (decoded.length === 32) return decoded;

  return createHash('sha256').update(raw).digest();
}

function decodeKey(raw: string): Buffer {
  const trimmed = raw.trim();
  if (/^[0-9a-f]{64}$/i.test(trimmed)) return Buffer.from(trimmed, 'hex');

  try {
    const base64 = Buffer.from(trimmed, 'base64');
    if (base64.length === 32) return base64;
  } catch {
    // Fall through to utf8 hash input.
  }

  const utf8 = Buffer.from(trimmed, 'utf8');
  if (utf8.length === 32 && timingSafeEqual(utf8, utf8)) return utf8;
  return utf8;
}

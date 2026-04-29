// v1 implementation. In v1.5 this module is replaced with an Arcium MPC client behind the same exports.
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

const { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } = naclUtil;

import { AgoraError } from '../errors/index.ts';

const PUBLIC_KEY_BYTES = nacl.box.publicKeyLength;
const NONCE_BYTES = nacl.box.nonceLength;

export function generateKeyPair(): { publicKey: Uint8Array; secretKey: Uint8Array } {
  return nacl.box.keyPair();
}

export function encryptForRecipient(plaintext: string, recipientPublicKey: Uint8Array): string {
  try {
    const ephemeral = nacl.box.keyPair();
    const nonce = nacl.randomBytes(NONCE_BYTES);
    const message = decodeUTF8(plaintext);
    const ciphertext = nacl.box(message, nonce, recipientPublicKey, ephemeral.secretKey);
    const payload = new Uint8Array(PUBLIC_KEY_BYTES + NONCE_BYTES + ciphertext.length);
    payload.set(ephemeral.publicKey, 0);
    payload.set(nonce, PUBLIC_KEY_BYTES);
    payload.set(ciphertext, PUBLIC_KEY_BYTES + NONCE_BYTES);
    return encodeBase64(payload);
  } catch (cause) {
    throw new AgoraError('Failed to encrypt payload', { code: 'ENCRYPTION_FAILED', cause });
  }
}

export function decryptFromSender(encryptedBase64: string, recipientSecretKey: Uint8Array): string {
  try {
    const payload = decodeBase64(encryptedBase64);
    if (payload.length <= PUBLIC_KEY_BYTES + NONCE_BYTES) {
      throw new Error('Encrypted payload is too short');
    }

    const ephemeralPublicKey = payload.slice(0, PUBLIC_KEY_BYTES);
    const nonce = payload.slice(PUBLIC_KEY_BYTES, PUBLIC_KEY_BYTES + NONCE_BYTES);
    const ciphertext = payload.slice(PUBLIC_KEY_BYTES + NONCE_BYTES);
    const plaintext = nacl.box.open(ciphertext, nonce, ephemeralPublicKey, recipientSecretKey);

    if (!plaintext) {
      throw new Error('Unable to decrypt payload');
    }

    return encodeUTF8(plaintext);
  } catch (cause) {
    throw new AgoraError('Failed to decrypt payload', { code: 'DECRYPTION_FAILED', cause });
  }
}

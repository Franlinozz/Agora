declare module 'tweetnacl-util' {
  export function decodeUTF8(value: string): Uint8Array;
  export function encodeUTF8(value: Uint8Array): string;
  export function decodeBase64(value: string): Uint8Array;
  export function encodeBase64(value: Uint8Array): string;
}

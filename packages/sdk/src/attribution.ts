import { concatHex, encodeFunctionData, type Abi, type Account, type Address, type Hash, type Hex, type WalletClient } from 'viem';

export const BASE_CHAIN_ID = 8453;
export const BASE_BUILDER_CODE = process.env.NEXT_PUBLIC_BASE_BUILDER_CODE || 'bc_4audxpcw';
export const ERC_8021_MARKER = '0x80218021802180218021802180218021' as const;

function utf8ToHex(value: string): Hex {
  if (typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(value);
    return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  }

  return `0x${Buffer.from(value, 'utf8').toString('hex')}`;
}

export function builderCodeDataSuffix(builderCode = BASE_BUILDER_CODE): Hex {
  const codeHex = utf8ToHex(builderCode);
  const byteLength = (codeHex.length - 2) / 2;

  if (!builderCode || byteLength === 0) {
    throw new Error('Base Builder Code is required for transaction attribution.');
  }

  if (byteLength > 255) {
    throw new Error('Base Builder Code is too long for ERC-8021 attribution.');
  }

  const lengthSuffix = `0x${byteLength.toString(16).padStart(2, '0')}` as Hex;
  return concatHex([codeHex, lengthSuffix, '0x00', ERC_8021_MARKER]);
}

export function shouldAttributeChain(chainId: number | string): boolean {
  return Number(chainId) === BASE_CHAIN_ID;
}

export function appendBaseAttribution(chainId: number | string, data: Hex): Hex {
  if (!shouldAttributeChain(chainId)) return data;
  return concatHex([data, builderCodeDataSuffix()]);
}

export async function writeAttributedContract(args: {
  chainId: number | string;
  wallet: WalletClient;
  account: Account;
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}): Promise<Hash> {
  const data = encodeFunctionData({
    abi: args.abi,
    functionName: args.functionName,
    args: args.args ?? [],
  });

  return args.wallet.sendTransaction({
    to: args.address,
    data: appendBaseAttribution(args.chainId, data),
    account: args.wallet.account ?? args.account,
    chain: null,
  });
}

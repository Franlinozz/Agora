import { decodeEventLog, type Abi, type Hex, type Log } from 'viem';

export type DecodedIndexerLog = Log & {
  eventName: string;
  args: Record<string, unknown>;
  removed?: boolean;
};

export function decodeAnyEvent(log: Log, abis: readonly Abi[]): DecodedIndexerLog | null {
  for (const abi of abis) {
    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics: log.topics,
      });

      if (!decoded.eventName) continue;

      return {
        ...log,
        eventName: decoded.eventName,
        args: decoded.args as unknown as Record<string, unknown>,
      };
    } catch {
      // Try the next contract ABI.
    }
  }

  return null;
}

export function assertHexAddress(address: string | undefined): Hex | undefined {
  if (!address) return undefined;
  if (!address.startsWith('0x')) {
    throw new Error(`Invalid contract address: ${address}`);
  }
  return address as Hex;
}

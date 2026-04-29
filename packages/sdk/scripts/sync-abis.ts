import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');

const contracts = [
  ['AgentRegistry', 'agentRegistryAbi', 'agentRegistry'],
  ['EscrowManager', 'escrowManagerAbi', 'escrowManager'],
  ['ReputationOracle', 'reputationOracleAbi', 'reputationOracle'],
] as const;

const outDir = resolve(repoRoot, 'packages/sdk/src/abis');
mkdirSync(outDir, { recursive: true });

for (const [contractName, exportName, fileName] of contracts) {
  const artifactPath = resolve(
    repoRoot,
    `packages/contracts/out/${contractName}.sol/${contractName}.json`,
  );
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8')) as { abi?: unknown };
  if (!artifact.abi) {
    throw new Error(`Missing abi in ${artifactPath}`);
  }

  const body = `import type { Abi } from 'viem';\n\nexport const ${exportName} = ${JSON.stringify(
    artifact.abi,
    null,
    2,
  )} as const satisfies Abi;\n`;
  writeFileSync(resolve(outDir, `${fileName}.ts`), body);
}

import { z } from 'zod';

const optionalNonEmptyString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.string().url().optional());

const urlOrMock = z.string().url().or(z.string().startsWith('mock://'));

const envSchema = z.object({
  NEXT_PUBLIC_ARC_RPC_URL: urlOrMock.default('https://rpc.testnet.arc.network'),
  NEXT_PUBLIC_ARC_USDC_ADDRESS: optionalNonEmptyString,
  NEXT_PUBLIC_ARC_AGENT_REGISTRY: optionalNonEmptyString,
  NEXT_PUBLIC_ARC_ESCROW_MANAGER: optionalNonEmptyString,
  NEXT_PUBLIC_ARC_REPUTATION_ORACLE: optionalNonEmptyString,
  ARC_DEPLOYER_PRIVATE_KEY: optionalNonEmptyString,
  NEXT_PUBLIC_BASE_RPC_URL: z.string().url().default('https://mainnet.base.org'),
  NEXT_PUBLIC_BASE_AGENT_REGISTRY: optionalNonEmptyString,
  NEXT_PUBLIC_BASE_ESCROW_MANAGER: optionalNonEmptyString,
  NEXT_PUBLIC_BASE_REPUTATION_ORACLE: optionalNonEmptyString,
  BASE_DEPLOYER_PRIVATE_KEY: optionalNonEmptyString,
  NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID: optionalNonEmptyString,
  ALCHEMY_API_KEY: optionalNonEmptyString,
  DATABASE_URL: optionalUrl.default('postgres://agora:agora@localhost:5432/agora'),
  API_GATEWAY_PORT: z.coerce.number().int().positive().default(4000),
  API_GATEWAY_HOST: z.string().min(1).default('0.0.0.0'),
  API_GATEWAY_SECRET: optionalNonEmptyString,
  OPENAI_API_KEY: optionalNonEmptyString,
  AI_MEDIATOR_DAILY_CAP_CENTS: z.coerce.number().int().positive().default(20),
  MEDIATOR_PUBLIC_KEY: optionalNonEmptyString,
  MEDIATOR_SECRET_KEY: optionalNonEmptyString,
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type AgoraEnv = z.infer<typeof envSchema>;

export function loadEnv(): AgoraEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. See errors above.');
  }
  return parsed.data;
}

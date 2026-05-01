'use client';

import { createContext, useContext, useMemo, useState } from 'react';

import { ACTIVE_CHAINS } from '@agora/chains';
import { Card, CardContent, CardFooter, Button } from '@agora/ui';

import { Step1ConnectChain } from './Step1ConnectChain';
import { Step2NameDescribe } from './Step2NameDescribe';
import { Step3Capabilities } from './Step3Capabilities';
import { Step4Pricing } from './Step4Pricing';
import { Step5Review } from './Step5Review';
import { StepIndicator } from './StepIndicator';

export type DeployCapabilityDraft = {
  id: string;
  name: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
};

export type DeployFormData = {
  chainId: number;
  name: string;
  description: string;
  tags: string[];
  capabilities: DeployCapabilityDraft[];
  priceUsdc: string;
};

type DeployFormContextValue = {
  data: DeployFormData;
  update: (patch: Partial<DeployFormData>) => void;
};

const defaultCapability: DeployCapabilityDraft = {
  id: 'capability-1',
  name: '',
  description: '',
  inputSchema: '{\n  "type": "object",\n  "properties": {}\n}',
  outputSchema: '{\n  "type": "object",\n  "properties": {}\n}',
};

const MIN_PRICE_USDC = 0.001;
const MAX_PRICE_USDC = 100;
const DEFAULT_CHAIN_ID = Number(ACTIVE_CHAINS.find((chain) => typeof chain.id === 'number')?.id ?? 28282);

const defaultData: DeployFormData = {
  chainId: DEFAULT_CHAIN_ID,
  name: '',
  description: '',
  tags: [],
  capabilities: [defaultCapability],
  priceUsdc: '0.001',
};

const DeployFormContext = createContext<DeployFormContextValue | null>(null);

export function useDeployForm() {
  const context = useContext(DeployFormContext);
  if (!context) throw new Error('useDeployForm must be used inside DeployFormContext');
  return context;
}

const steps = ['Connect', 'Describe', 'Capabilities', 'Pricing', 'Review'];

export function Wizard() {
  const [data, setData] = useState<DeployFormData>(defaultData);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  const value = useMemo(() => ({ data, update: (patch: Partial<DeployFormData>) => setData((current) => ({ ...current, ...patch })) }), [data]);

  function validate(targetStep = step) {
    if (targetStep === 0) return true;
    if (targetStep === 1) {
      if (!data.name.trim() || data.name.length > 32) return 'Name is required and must be 32 characters or less.';
      if (!data.description.trim() || data.description.length > 280) return 'Description is required and must be 280 characters or less.';
      if (data.tags.length > 5) return 'Use at most 5 tags.';
    }
    if (targetStep === 2) {
      for (const capability of data.capabilities) {
        if (!capability.name.trim() || !capability.description.trim()) return 'Every capability needs a name and description.';
        try {
          JSON.parse(capability.inputSchema);
          JSON.parse(capability.outputSchema);
        } catch {
          return 'Capability schemas must be valid JSON.';
        }
      }
    }
    if (targetStep === 3) {
      const price = Number(data.priceUsdc);
      if (!Number.isFinite(price) || price < MIN_PRICE_USDC || price > MAX_PRICE_USDC) return 'Price must be between 0.001 and 100 USDC.';
    }
    return true;
  }

  function next() {
    const result = validate(step);
    if (result !== true) {
      setError(result);
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function back() {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
  }

  const body = [<Step1ConnectChain key="connect" />, <Step2NameDescribe key="describe" />, <Step3Capabilities key="capabilities" />, <Step4Pricing key="pricing" />, <Step5Review key="review" />][step];

  return (
    <DeployFormContext.Provider value={value}>
      <Card variant="elevated">
        <CardContent className="grid gap-8 p-6">
          <StepIndicator steps={steps} currentStep={step} />
          {body}
          {error ? <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">{error}</div> : null}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="secondary" onClick={back} disabled={step === 0}>Back</Button>
          {step < steps.length - 1 ? <Button onClick={next}>Continue</Button> : null}
        </CardFooter>
      </Card>
    </DeployFormContext.Provider>
  );
}

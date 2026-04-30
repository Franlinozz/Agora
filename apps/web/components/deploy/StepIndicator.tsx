import { cn } from '@agora/ui';

export function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex min-w-0 flex-1 items-center gap-2">
            <div className={cn('grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold', index <= currentStep ? 'border-[var(--color-arc-purple)] bg-[var(--color-arc-purple)] text-white' : 'border-[var(--color-bg-3)] text-[var(--color-text-tertiary)]')}>{index + 1}</div>
            <span className={cn('hidden truncate text-sm sm:block', index === currentStep ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]')}>{step}</span>
            {index < steps.length - 1 ? <div className={cn('hidden h-px flex-1 sm:block', index < currentStep ? 'bg-[var(--color-arc-purple)]' : 'bg-[var(--color-bg-3)]')} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

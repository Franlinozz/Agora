import React from 'react';

export function UsdcAmount({ amount, precision = 2 }: { amount: bigint; precision?: number }) {
  const value = Number(amount) / 1_000_000;
  return <span className="tabular-nums">${value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}</span>;
}

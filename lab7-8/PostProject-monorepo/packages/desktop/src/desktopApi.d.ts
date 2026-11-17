import type { Calculation, CalculationInput, CalculationSummary } from '@postproject/core';

export interface CalculationView extends Calculation {
  dateLabel: string;
  daysLabel: string;
  estimateLabel: string;
  detailsLabel: string;
}

export type CalculationResult = { ok: true; calculation: CalculationView } | { ok: false; error: string };

declare global {
  interface Window {
    calculationsAPI: {
      list: (query: string) => Promise<{ calculations: CalculationView[]; summary: CalculationSummary }>;
      add: (input: CalculationInput) => Promise<(CalculationResult & { source?: 'server' | 'local' })>;
      toggle: (id: number) => Promise<CalculationResult>;
      remove: (id: number) => Promise<{ ok: true } | { ok: false; error: string }>;
    };
  }
}

import type { Calculation } from './calculations';

declare global {
  interface Window {
    calculationsAPI: {
      loadCalculations: () => Promise<Calculation[]>;
      saveCalculations: (calculations: Calculation[]) => Promise<boolean>;
    };
  }
}

export {};

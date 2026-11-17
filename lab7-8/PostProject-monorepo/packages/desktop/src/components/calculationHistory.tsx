import type { CalculationSummary } from '@postproject/core';
import type { CalculationView } from '../desktopApi';
import { input } from '../ui';
import CalculationItem from './calculationItem';

interface CalculationHistoryProps {
  calculations: CalculationView[];
  summary: CalculationSummary;
  query: string;
  onQueryChange: (query: string) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function CalculationHistory({ calculations, summary, query, onQueryChange, onToggle, onDelete }: CalculationHistoryProps) {
  return (
    <section className="mt-6">
      <h3 className="mb-1 text-xl font-bold text-heading">Історія розрахунків</h3>
      <p className="mb-4 text-muted">
        Усього розрахунків: {summary.total} · Оформлено: {summary.issued}
      </p>

      {summary.total > 0 && (
        <input
          type="search"
          className={`${input} mb-4`}
          placeholder="Пошук: експрес, 540 км, дата…"
          aria-label="Пошук у історії розрахунків"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      )}

      {calculations.length === 0 ? (
        <p className="text-center text-muted">
          {summary.total === 0 ? 'Розрахунків поки немає. Зробіть перший!' : 'Нічого не знайдено.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {calculations.map((calculation) => (
            <CalculationItem key={calculation.id} calculation={calculation} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}

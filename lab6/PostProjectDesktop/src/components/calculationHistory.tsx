import type { Calculation } from '../calculations';
import CalculationItem from './calculationItem';

interface CalculationHistoryProps {
  calculations: Calculation[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function CalculationHistory({ calculations, onToggle, onDelete }: CalculationHistoryProps) {
  const issued = calculations.filter((item) => item.issued).length;

  return (
    <section className="mt-6">
      <h3 className="mb-1 text-xl font-bold text-heading">Історія розрахунків</h3>
      <p className="mb-4 text-muted">
        Усього розрахунків: {calculations.length} · Оформлено: {issued}
      </p>

      {calculations.length === 0 ? (
        <p className="text-center text-muted">Розрахунків поки немає. Зробіть перший!</p>
      ) : (
        <ul className="space-y-3">
          {[...calculations].reverse().map((calculation) => (
            <CalculationItem key={calculation.id} calculation={calculation} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}

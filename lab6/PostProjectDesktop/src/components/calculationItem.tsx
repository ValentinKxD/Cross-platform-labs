import { DELIVERY_TYPE_TITLES, type Calculation } from '../calculations';
import { daysLabel, formatDateTime } from '../format';

interface CalculationItemProps {
  calculation: Calculation;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function CalculationItem({ calculation, onToggle, onDelete }: CalculationItemProps) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg p-4 max-sm:flex-col max-sm:items-stretch ${
        calculation.issued ? 'bg-done' : 'bg-accent-soft'
      }`}
    >
      <label className="flex flex-1 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={calculation.issued}
          onChange={() => onToggle(calculation.id)}
          className="mt-1 size-5 shrink-0 accent-accent"
          aria-label="Оформлено"
        />
        <span className={calculation.issued ? 'text-muted line-through' : 'text-ink'}>
          <span className="block font-bold">
            {calculation.cost} ₴ · {daysLabel(calculation.days)}
          </span>
          <span className="block">
            {String(calculation.weightKg).replace('.', ',')} кг · {calculation.distanceKm} км · {DELIVERY_TYPE_TITLES[calculation.deliveryType]}
          </span>
          <span className="block text-sm text-muted">{formatDateTime(calculation.createdAt)}</span>
        </span>
      </label>
      <button
        type="button"
        onClick={() => onDelete(calculation.id)}
        className="cursor-pointer rounded-md bg-rose-500 px-3.5 py-2 text-white hover:bg-rose-700"
      >
        Видалити
      </button>
    </li>
  );
}

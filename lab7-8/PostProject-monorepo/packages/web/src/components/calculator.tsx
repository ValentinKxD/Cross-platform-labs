import { useCallback, useEffect, useState } from 'react';
import { DELIVERY_TYPE_OPTIONS, formatDays, type Calculation, type CalculationSummary, type DeliveryType } from '@postproject/core';
import { calculationsService } from '../calculationsService';
import { buttonRow, field, input, mainButton, resultBox, select } from '../ui';
import CalculationHistory from './calculationHistory';

type Message = { text: string; type: 'error' | 'success' };

const OFFLINE_NOTE = ' Сервер недоступний, розраховано за тарифами PostProject.';

export default function Calculator() {
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [query, setQuery] = useState('');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [summary, setSummary] = useState<CalculationSummary>({ total: 0, issued: 0 });
  const [result, setResult] = useState<Calculation | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const [list, totals] = await Promise.all([calculationsService.list(query), calculationsService.summary()]);
    setCalculations(list);
    setSummary(totals);
  }, [query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await calculationsService.add({ weight, distance, deliveryType });
    setLoading(false);

    if (!res.ok) {
      setResult(null);
      setMessage({ text: res.error, type: 'error' });
      return;
    }

    setResult(res.calculation);
    setMessage({ text: `Розрахунок додано до історії.${res.source === 'local' ? OFFLINE_NOTE : ''}`, type: 'success' });
    setWeight('');
    setDistance('');
    setDeliveryType('standard');
    await refresh();
  };

  const toggleCalculation = async (id: number) => {
    const res = await calculationsService.toggleIssued(id);
    if (res.ok) {
      setMessage({ text: res.calculation.issued ? 'Розрахунок позначено як оформлений.' : 'Позначку «Оформлено» знято.', type: 'success' });
    } else {
      setMessage({ text: res.error, type: 'error' });
    }
    await refresh();
  };

  const deleteCalculation = async (id: number) => {
    const res = await calculationsService.remove(id);
    if (res.ok) {
      if (result?.id === id) setResult(null);
      setMessage({ text: 'Розрахунок видалено.', type: 'success' });
    } else {
      setMessage({ text: res.error, type: 'error' });
    }
    await refresh();
  };

  return (
    <>
      <form onSubmit={handleCalculate} noValidate>
        <div className={field}>
          <label htmlFor="weight">Вага посилки (кг):</label>
          <input
            id="weight"
            type="text"
            inputMode="decimal"
            placeholder="2,5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={input}
          />
        </div>

        <div className={field}>
          <label htmlFor="distance">Відстань доставки (км):</label>
          <input
            id="distance"
            type="text"
            inputMode="decimal"
            placeholder="540"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className={input}
          />
        </div>

        <div className={field}>
          <label htmlFor="type-delivery">Тип доставки:</label>
          <select
            id="type-delivery"
            name="type"
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
            className={select}
          >
            {DELIVERY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className={buttonRow}>
          <button type="submit" className={mainButton} disabled={loading}>
            {loading ? 'Розрахунок...' : 'Розрахувати'}
          </button>
        </div>
      </form>

      {message && (
        <p className={message.type === 'error' ? 'mb-4 font-bold text-danger' : 'mb-4 font-bold text-success'}>
          {message.text}
        </p>
      )}

      {result && (
        <div className={`${resultBox} px-[15px] py-1`}>
          <div className="flex items-center justify-between gap-2.5 py-3.5">
            <span>Орієнтовна вартість</span>
            <strong className="text-[1.4rem] text-accent">{result.cost} ₴</strong>
          </div>
          <div className="flex items-center justify-between gap-2.5 border-t border-grid py-3.5">
            <span>Орієнтовний час у дорозі</span>
            <strong className="text-[1.4rem] text-accent">{formatDays(result.days)}</strong>
          </div>
        </div>
      )}

      <CalculationHistory
        calculations={calculations}
        summary={summary}
        query={query}
        onQueryChange={setQuery}
        onToggle={toggleCalculation}
        onDelete={deleteCalculation}
      />
    </>
  );
}

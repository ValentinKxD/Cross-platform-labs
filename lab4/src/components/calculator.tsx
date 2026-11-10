import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { CALCULATE_DELIVERY, type DeliveryType } from '../graphql';
import { daysLabel, errorMessages } from '../format';
import { loadCalculations, saveCalculations, type Calculation } from '../calculations';
import { buttonRow, field, input, mainButton, resultBox, select } from '../ui';
import CalculationHistory from './calculationHistory';

type Message = { text: string; type: 'error' | 'success' };

export default function Calculator() {
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [calculations, setCalculations] = useState<Calculation[]>(loadCalculations);
  const [result, setResult] = useState<Calculation | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [calculate, { loading }] = useLazyQuery(CALCULATE_DELIVERY, { fetchPolicy: 'network-only' });

  useEffect(() => {
    saveCalculations(calculations);
  }, [calculations]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    const weightKg = parseFloat(weight.replace(',', '.'));
    const distanceKm = parseFloat(distance.replace(',', '.'));

    if (isNaN(weightKg) || isNaN(distanceKm)) {
      setMessage({ text: 'Вкажіть вагу посилки та відстань доставки.', type: 'error' });
      return;
    }

    try {
      const { data } = await calculate({ variables: { weightKg, distanceKm, deliveryType } });
      if (!data) return;

      const newCalculation: Calculation = {
        id: Date.now(),
        weightKg,
        distanceKm,
        deliveryType,
        cost: data.calculateDelivery.cost,
        days: data.calculateDelivery.days,
        createdAt: new Date().toISOString(),
        issued: false,
      };
      setCalculations([...calculations, newCalculation]);
      setResult(newCalculation);
      setMessage({ text: 'Розрахунок додано до історії.', type: 'success' });
      setWeight('');
      setDistance('');
      setDeliveryType('standard');
    } catch (err) {
      setResult(null);
      setMessage({ text: errorMessages(err).join('. '), type: 'error' });
    }
  };

  const toggleCalculation = (id: number) => {
    setCalculations(calculations.map((item) => (item.id === id ? { ...item, issued: !item.issued } : item)));
  };

  const deleteCalculation = (id: number) => {
    setCalculations(calculations.filter((item) => item.id !== id));
    if (result?.id === id) setResult(null);
    setMessage({ text: 'Розрахунок видалено.', type: 'success' });
  };

  return (
    <>
      <form onSubmit={handleCalculate} noValidate>
        <div className={field}>
          <label htmlFor="weight">Вага посилки (кг):</label>
          <input
            id="weight"
            type="number"
            min="0.1"
            step="0.1"
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
            type="number"
            min="1"
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
            <option value="standard">Стандартна</option>
            <option value="express">Експрес</option>
          </select>
        </div>

        <div className={buttonRow}>
          <button type="submit" className={mainButton} disabled={loading}>
            Розрахувати
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
            <strong className="text-[1.4rem] text-accent">{daysLabel(result.days)}</strong>
          </div>
        </div>
      )}

      <CalculationHistory calculations={calculations} onToggle={toggleCalculation} onDelete={deleteCalculation} />
    </>
  );
}

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLazyQuery } from '@apollo/client/react';
import { CALCULATE_DELIVERY, type DeliveryType } from '../graphql';
import { daysLabel, errorMessages } from '../format';
import { loadCalculations, saveCalculations, type Calculation } from '../calculations';
import { notify } from '../notify';
import { useStyles, type Palette } from '../theme';
import CalculatorHeader from './CalculatorHeader';
import CalculationForm from './CalculationForm';
import CalculationList from './CalculationList';
import { ResultBox } from './ui';

function parseNumber(value: string) {
  return parseFloat(value.trim().replace(',', '.'));
}

export default function Calculator() {
  const styles = useStyles(createStyles);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState<Calculation | null>(null);
  const [calculate, { loading }] = useLazyQuery(CALCULATE_DELIVERY, { fetchPolicy: 'network-only' });

  useEffect(() => {
    loadCalculations().then((saved) => {
      setCalculations(saved);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveCalculations(calculations);
  }, [calculations, loaded]);

  const addCalculation = async (weight: string, distance: string, deliveryType: DeliveryType) => {
    const weightKg = parseNumber(weight);
    const distanceKm = parseNumber(distance);

    if (!weight.trim() || !distance.trim()) {
      notify('Помилка', 'Вкажіть вагу посилки та відстань доставки.');
      return false;
    }
    if (isNaN(weightKg) || isNaN(distanceKm) || weightKg <= 0 || distanceKm <= 0) {
      notify('Помилка', 'Вага та відстань мають бути додатними числами.');
      return false;
    }

    try {
      const { data } = await calculate({ variables: { weightKg, distanceKm, deliveryType } });
      if (!data) return false;

      const newCalculation: Calculation = {
        id: Date.now().toString(),
        weightKg,
        distanceKm,
        deliveryType,
        cost: data.calculateDelivery.cost,
        days: data.calculateDelivery.days,
        createdAt: new Date().toISOString(),
        issued: false,
      };
      setCalculations((current) => [newCalculation, ...current]);
      setResult(newCalculation);
      notify('Готово', `Розрахунок додано до історії: ${newCalculation.cost} ₴, ${daysLabel(newCalculation.days)}.`);
      return true;
    } catch (err) {
      setResult(null);
      notify('Помилка', errorMessages(err).join('\n'));
      return false;
    }
  };

  const toggleCalculation = (id: string) => {
    setCalculations((current) => current.map((item) => (item.id === id ? { ...item, issued: !item.issued } : item)));
  };

  const deleteCalculation = (id: string) => {
    setCalculations((current) => current.filter((item) => item.id !== id));
    if (result?.id === id) setResult(null);
    notify('Видалено', 'Розрахунок видалено з історії.');
  };

  const issued = calculations.filter((item) => item.issued).length;

  const header = (
    <View>
      <CalculatorHeader total={calculations.length} issued={issued} />
      <CalculationForm onAdd={addCalculation} loading={loading} />

      {result && (
        <ResultBox style={styles.result}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Орієнтовна вартість</Text>
            <Text style={styles.resultValue}>{result.cost} ₴</Text>
          </View>
          <View style={[styles.resultRow, styles.resultDivider]}>
            <Text style={styles.resultLabel}>Орієнтовний час у дорозі</Text>
            <Text style={styles.resultValue}>{daysLabel(result.days)}</Text>
          </View>
        </ResultBox>
      )}
    </View>
  );

  return <CalculationList calculations={calculations} onToggle={toggleCalculation} onDelete={deleteCalculation} header={header} />;
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    result: {
      paddingHorizontal: 15,
      marginBottom: 20,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 12,
    },
    resultDivider: {
      borderTopWidth: 1,
      borderTopColor: c.grid,
    },
    resultLabel: {
      flex: 1,
      fontSize: 15,
      color: c.ink,
    },
    resultValue: {
      fontSize: 22,
      fontWeight: 'bold',
      color: c.accent,
    },
  });

import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDays, type Calculation, type CalculationSummary, type DeliveryType } from '@postproject/core';
import { calculationsService } from '../calculationsService';
import { notify } from '../notify';
import { useStyles, type Palette } from '../theme';
import CalculatorHeader from './CalculatorHeader';
import CalculationForm from './CalculationForm';
import CalculationList from './CalculationList';
import { Input, ResultBox } from './ui';

export default function Calculator() {
  const styles = useStyles(createStyles);
  const [query, setQuery] = useState('');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [summary, setSummary] = useState<CalculationSummary>({ total: 0, issued: 0 });
  const [result, setResult] = useState<Calculation | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [list, totals] = await Promise.all([calculationsService.list(query), calculationsService.summary()]);
    setCalculations(list);
    setSummary(totals);
  }, [query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCalculation = async (weight: string, distance: string, deliveryType: DeliveryType) => {
    setBusy(true);
    const res = await calculationsService.add({ weight, distance, deliveryType });
    setBusy(false);

    if (!res.ok) {
      setResult(null);
      notify('Помилка', res.error);
      return false;
    }

    setResult(res.calculation);
    const offline = res.source === 'local' ? '\n\nСервер недоступний, розраховано на пристрої за тарифами PostProject.' : '';
    notify('Готово', `Розрахунок додано до історії: ${res.calculation.cost} ₴, ${formatDays(res.calculation.days)}.${offline}`);
    await refresh();
    return true;
  };

  const toggleCalculation = async (id: number) => {
    const res = await calculationsService.toggleIssued(id);
    if (!res.ok) notify('Помилка', res.error);
    await refresh();
  };

  const deleteCalculation = async (id: number) => {
    const res = await calculationsService.remove(id);
    if (res.ok) {
      if (result?.id === id) setResult(null);
      notify('Видалено', 'Розрахунок видалено з історії.');
    } else {
      notify('Помилка', res.error);
    }
    await refresh();
  };

  const header = (
    <View>
      <CalculatorHeader total={summary.total} issued={summary.issued} />
      <CalculationForm onAdd={addCalculation} loading={busy} />

      {result && (
        <ResultBox style={styles.result}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Орієнтовна вартість</Text>
            <Text style={styles.resultValue}>{result.cost} ₴</Text>
          </View>
          <View style={[styles.resultRow, styles.resultDivider]}>
            <Text style={styles.resultLabel}>Орієнтовний час у дорозі</Text>
            <Text style={styles.resultValue}>{formatDays(result.days)}</Text>
          </View>
        </ResultBox>
      )}
    </View>
  );

  const search =
    summary.total > 0 ? (
      <Input
        style={styles.search}
        placeholder="Пошук: експрес, 540 км, дата…"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />
    ) : undefined;

  return (
    <CalculationList
      calculations={calculations}
      emptyText={summary.total === 0 ? 'Розрахунків поки немає. Зробіть перший!' : 'Нічого не знайдено.'}
      onToggle={toggleCalculation}
      onDelete={deleteCalculation}
      header={header}
      search={search}
    />
  );
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
    search: {
      marginBottom: 12,
    },
  });

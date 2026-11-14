import { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { MY_WAYBILLS, type Waybill } from '../graphql';
import { errorMessages, formatDate } from '../format';
import { useStyles, useTheme, type Palette } from '../theme';
import AppModal from './AppModal';
import Timeline from './Timeline';
import { Input, Segmented, StatusBadge } from './ui';

type Filter = 'all' | 'transit' | 'received';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'transit', label: 'В дорозі' },
  { value: 'received', label: 'Отримані' },
];

const IN_TRANSIT: Waybill['status'][] = ['accepted', 'in_transit', 'arrived'];

function matchesFilter(waybill: Waybill, filter: Filter) {
  if (filter === 'transit') return IN_TRANSIT.includes(waybill.status);
  if (filter === 'received') return waybill.status === 'received';
  return true;
}

export default function History() {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [onlyActive, setOnlyActive] = useState(false);
  const [search, setSearch] = useState('');
  const [tracked, setTracked] = useState<Waybill | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useQuery(MY_WAYBILLS, { fetchPolicy: 'cache-and-network' });

  const query = search.replace(/\s/g, '');
  const waybills = (data?.myWaybills ?? []).filter((waybill) =>
    matchesFilter(waybill, filter)
    && (!onlyActive || waybill.status !== 'received')
    && waybill.trackingNumber.includes(query)
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch {
    } finally {
      setRefreshing(false);
    }
  };

  const header = (
    <View>
      <Text style={styles.title}>Історія відправлень</Text>
      <View style={styles.filters}>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Лише активні</Text>
          <Switch
            value={onlyActive}
            onValueChange={setOnlyActive}
            trackColor={{ false: colors.line, true: colors.accent }}
            thumbColor="#ffffff"
          />
        </View>
        <Input placeholder="Пошук за номером накладної" keyboardType="numeric" value={search} onChangeText={setSearch} />
      </View>
      {error && <Text style={styles.error}>{errorMessages(error)[0]}</Text>}
    </View>
  );

  return (
    <>
      <FlatList
        data={waybills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.number}>{item.trackingNumber}</Text>
            <Row label="Дата" value={formatDate(item.createdAt)} />
            <Row label="Маршрут" value={`${item.cityFrom} ➔ ${item.cityTo}`} />
            <Row label="Вартість" value={`${item.cost} ₴`} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Статус</Text>
              <StatusBadge status={item.status} title={item.statusTitle} />
            </View>
            <TouchableOpacity style={styles.trackButton} onPress={() => setTracked(item)}>
              <Text style={styles.trackButtonText}>Відстежити</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>{loading && !data ? 'Завантаження...' : 'Відправлень не знайдено'}</Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      />

      <AppModal visible={tracked !== null} title={`Накладна ${tracked?.trackingNumber ?? ''}`} onClose={() => setTracked(null)}>
        {tracked && <Timeline waybill={tracked} />}
      </AppModal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      padding: 16,
      paddingBottom: 32,
      width: '100%',
      maxWidth: 700,
      alignSelf: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: c.heading,
      marginBottom: 14,
    },
    filters: {
      gap: 12,
      marginBottom: 16,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchLabel: {
      fontSize: 15,
      color: c.ink,
    },
    error: {
      marginBottom: 12,
      color: c.danger,
    },
    item: {
      borderWidth: 1,
      borderColor: c.grid,
      borderRadius: 10,
      backgroundColor: c.surfaceSoft,
      marginBottom: 12,
      overflow: 'hidden',
    },
    number: {
      fontSize: 16,
      fontWeight: 'bold',
      color: c.ink,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.grid,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: c.grid,
    },
    rowLabel: {
      fontSize: 14,
      color: c.muted,
    },
    rowValue: {
      flexShrink: 1,
      fontSize: 15,
      color: c.ink,
      textAlign: 'right',
    },
    trackButton: {
      margin: 10,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 6,
      backgroundColor: c.surface,
    },
    trackButtonText: {
      fontSize: 15,
      color: c.ink,
    },
    empty: {
      textAlign: 'center',
      color: c.muted,
      fontSize: 15,
      marginTop: 12,
    },
  });

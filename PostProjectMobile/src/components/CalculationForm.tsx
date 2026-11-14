import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { DeliveryType } from '../graphql';
import { useStyles, useTheme, type Palette } from '../theme';
import { Segmented } from './ui';

interface CalculationFormProps {
  onAdd: (weight: string, distance: string, deliveryType: DeliveryType) => Promise<boolean>;
  loading: boolean;
}

const DELIVERY_OPTIONS: { value: DeliveryType; label: string }[] = [
  { value: 'standard', label: 'Стандартна' },
  { value: 'express', label: 'Експрес' },
];

export default function CalculationForm({ onAdd, loading }: CalculationFormProps) {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');

  const handleAdd = async () => {
    if (loading) return;
    const added = await onAdd(weight, distance, deliveryType);
    if (added) {
      setWeight('');
      setDistance('');
      setDeliveryType('standard');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Новий розрахунок</Text>

      <Text style={styles.label}>Вага посилки (кг):</Text>
      <TextInput
        style={styles.input}
        placeholder="2,5"
        placeholderTextColor={colors.muted}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        returnKeyType="next"
      />

      <Text style={styles.label}>Відстань доставки (км):</Text>
      <TextInput
        style={styles.input}
        placeholder="540"
        placeholderTextColor={colors.muted}
        keyboardType="numeric"
        value={distance}
        onChangeText={setDistance}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />

      <Text style={styles.label}>Тип доставки:</Text>
      <Segmented options={DELIVERY_OPTIONS} value={deliveryType} onChange={setDeliveryType} />

      <TouchableOpacity style={[styles.addButton, loading && styles.addButtonDisabled]} onPress={handleAdd} disabled={loading} activeOpacity={0.7}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.addButtonText}>Розрахувати</Text>}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: c.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: c.heading,
      marginBottom: 12,
    },
    label: {
      fontSize: 15,
      color: c.ink,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: c.ink,
      backgroundColor: c.surfaceSoft,
      marginBottom: 12,
    },
    addButton: {
      marginTop: 16,
      backgroundColor: c.accent,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    addButtonDisabled: {
      opacity: 0.6,
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

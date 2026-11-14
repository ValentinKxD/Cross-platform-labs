import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DELIVERY_TYPE_TITLES, type Calculation } from '../calculations';
import { daysLabel, formatDateTime } from '../format';
import { useStyles, type Palette } from '../theme';

interface CalculationItemProps {
  calculation: Calculation;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CalculationItem({ calculation, onToggle, onDelete }: CalculationItemProps) {
  const styles = useStyles(createStyles);
  const { issued } = calculation;

  return (
    <View style={[styles.item, issued && styles.itemDone]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => onToggle(calculation.id)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: issued }}
      >
        <View style={[styles.checkbox, issued && styles.checkboxChecked]}>
          {issued && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <View style={styles.texts}>
          <Text style={[styles.cost, issued && styles.textDone]}>
            {calculation.cost} ₴ · {daysLabel(calculation.days)}
          </Text>
          <Text style={[styles.text, issued && styles.textDone]}>
            {String(calculation.weightKg).replace('.', ',')} кг · {calculation.distanceKm} км · {DELIVERY_TYPE_TITLES[calculation.deliveryType]}
          </Text>
          <Text style={styles.date}>
            {formatDateTime(calculation.createdAt)}{issued ? ' · Оформлено' : ''}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(calculation.id)} activeOpacity={0.7}>
        <Text style={styles.deleteButtonText}>Видалити</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.accentSoft,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    itemDone: {
      backgroundColor: c.done,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      marginTop: 2,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: c.accent,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: c.accent,
    },
    checkMark: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: 'bold',
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    cost: {
      fontSize: 17,
      fontWeight: 'bold',
      color: c.ink,
    },
    text: {
      fontSize: 15,
      color: c.ink,
    },
    textDone: {
      color: c.muted,
      textDecorationLine: 'line-through',
    },
    date: {
      fontSize: 13,
      color: c.muted,
    },
    deleteButton: {
      backgroundColor: '#f43f5e',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    deleteButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
  });

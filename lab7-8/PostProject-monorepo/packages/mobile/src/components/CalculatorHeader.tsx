import { StyleSheet, Text, View } from 'react-native';
import { useStyles, type Palette } from '../theme';

interface CalculatorHeaderProps {
  total: number;
  issued: number;
}

export default function CalculatorHeader({ total, issued }: CalculatorHeaderProps) {
  const styles = useStyles(createStyles);

  return (
    <View>
      <Text style={styles.title}>Калькулятор вартості доставки</Text>
      <Text style={styles.stats}>
        Усього розрахунків: {total} · Оформлено: {issued}
      </Text>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: c.heading,
      textAlign: 'center',
      marginBottom: 8,
    },
    stats: {
      fontSize: 16,
      color: c.muted,
      textAlign: 'center',
      marginBottom: 16,
    },
  });

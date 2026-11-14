import { StyleSheet, Text, View } from 'react-native';
import { useStyles, type Palette } from '../theme';

const ROWS = [
  ['Фреймворк', 'React Native (Expo)'],
  ['Мова програмування', 'TypeScript'],
  ['Оформлення', 'StyleSheet, Flexbox'],
  ['Дані', 'Apollo Client, GraphQL API'],
  ['Сховище на пристрої', 'AsyncStorage'],
  ['Платформа запуску', 'Android / iOS'],
];

export default function TechStack() {
  const styles = useStyles(createStyles);

  return (
    <View>
      <Text style={styles.text}>
        Мобільну версію PostProject розроблено засобами React Native: JavaScript-код керує нативними компонентами Android та iOS, а бізнес-логіка і GraphQL API спільні з вебверсією.
      </Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headCell]}>Компонент</Text>
          <Text style={[styles.cell, styles.headCell]}>Технологія</Text>
        </View>
        {ROWS.map(([name, value]) => (
          <View key={name} style={styles.row}>
            <Text style={styles.cell}>{name}</Text>
            <Text style={styles.cell}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    text: {
      marginBottom: 16,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
    },
    table: {
      borderWidth: 1,
      borderColor: c.grid,
      borderRadius: 4,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
    },
    cell: {
      flex: 1,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.grid,
      padding: 12,
      fontSize: 15,
      color: c.ink,
    },
    headCell: {
      backgroundColor: c.thead,
      color: c.theadInk,
      fontWeight: '600',
    },
  });

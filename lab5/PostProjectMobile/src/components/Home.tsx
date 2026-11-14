import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStyles, type Palette } from '../theme';
import Tracking from './Tracking';
import TechStack from './TechStack';
import { Card } from './ui';

const FEATURES = [
  ['Відстеження посилки', 'дізнавайтесь статус та історію переміщення посилки за номером накладної.'],
  ['Створення електронної накладної', 'оформлюйте відправлення вдома без черг.'],
  ['Калькулятор вартості доставки', 'легко та просто розраховуйте вартість доставки до дверей.'],
  ['Орієнтовні дні доставки', 'разом з калькулятором прораховуйте, коли буде у вас посилка.'],
  ['Особистий кабінет', 'переглядайте історію своїх відправлень і редагуйте профіль.'],
];

export default function Home() {
  const styles = useStyles(createStyles);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card title="Про застосунок">
        <Text style={styles.about}>
          PostProject — кросплатформний застосунок у сфері поштової доставки та логістики. Мобільна версія працює на смартфонах і планшетах з Android та iOS.
        </Text>
      </Card>

      <Card title="Основні функції застосунку">
        {FEATURES.map(([title, text]) => (
          <View key={title} style={styles.feature}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>
              <Text style={styles.bold}>{title}:</Text> {text}
            </Text>
          </View>
        ))}
      </Card>

      <Card title="Відстеження посилки">
        <Tracking />
      </Card>

      <Card title="Обраний стек технологій">
        <TechStack />
      </Card>

      <Text style={styles.footer}>© 2026 PostProject. Кросплатформна розробка</Text>
    </ScrollView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      padding: 16,
    },
    about: {
      fontSize: 17,
      lineHeight: 25,
      color: c.ink,
    },
    feature: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    bullet: {
      fontSize: 16,
      color: c.accent,
    },
    featureText: {
      flex: 1,
      fontSize: 16,
      lineHeight: 23,
      color: c.ink,
    },
    bold: {
      fontWeight: 'bold',
    },
    footer: {
      marginVertical: 12,
      textAlign: 'center',
      color: c.muted,
    },
  });

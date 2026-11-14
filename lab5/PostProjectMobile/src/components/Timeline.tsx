import { StyleSheet, Text, View } from 'react-native';
import type { Waybill } from '../graphql';
import { formatDate, formatDateTime } from '../format';
import { useStyles, type Palette } from '../theme';
import { ResultBox, StatusBadge } from './ui';

const DELIVERED: Waybill['status'][] = ['arrived', 'received'];

export default function Timeline({ waybill }: { waybill: Waybill }) {
  const styles = useStyles(createStyles);
  const delivered = DELIVERED.includes(waybill.status);

  return (
    <ResultBox style={styles.box}>
      <View style={styles.head}>
        <Text style={styles.strong}>Статус посилки:</Text>
        <StatusBadge status={waybill.status} title={waybill.statusTitle} />
      </View>

      {waybill.events.map((event) => (
        <View key={event.id} style={styles.event}>
          <View style={styles.dot} />
          <View style={styles.eventText}>
            <Text style={styles.text}>{formatDateTime(event.eventTime)} – {event.title}</Text>
            {event.branch && <Text style={styles.small}>{event.branch.title}</Text>}
          </View>
        </View>
      ))}

      {waybill.events.length === 0 && (
        <View style={styles.event}>
          <View style={styles.dot} />
          <View style={styles.eventText}>
            <Text style={styles.text}>{formatDateTime(waybill.createdAt)} – Створено накладну</Text>
            <Text style={styles.small}>{waybill.cityFrom} ➔ {waybill.cityTo}</Text>
          </View>
        </View>
      )}

      {!delivered && (
        <View style={styles.event}>
          <View style={[styles.dot, styles.dotEmpty]} />
          <View style={styles.eventText}>
            <Text style={styles.text}>Очікується {formatDate(waybill.expectedAt)} – Прибуло у відділення</Text>
            <Text style={styles.small}>{waybill.toBranch?.title ?? waybill.cityTo}</Text>
          </View>
        </View>
      )}
    </ResultBox>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    box: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 4,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14,
    },
    strong: {
      fontWeight: 'bold',
      fontSize: 16,
      color: c.ink,
    },
    event: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },
    dot: {
      width: 12,
      height: 12,
      marginTop: 4,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: c.accent,
      backgroundColor: c.accent,
    },
    dotEmpty: {
      backgroundColor: c.surface,
    },
    eventText: {
      flex: 1,
    },
    text: {
      fontSize: 15,
      color: c.ink,
    },
    small: {
      marginTop: 3,
      fontSize: 13,
      color: c.muted,
    },
  });

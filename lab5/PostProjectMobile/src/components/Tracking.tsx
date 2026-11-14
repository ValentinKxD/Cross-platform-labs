import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLazyQuery } from '@apollo/client/react';
import { TRACK_WAYBILL } from '../graphql';
import { errorMessages } from '../format';
import { useStyles, type Palette } from '../theme';
import Timeline from './Timeline';
import { Field, Input, MainButton, ResultBox } from './ui';

export default function Tracking() {
  const styles = useStyles(createStyles);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [track, { data, loading, called }] = useLazyQuery(TRACK_WAYBILL, { fetchPolicy: 'network-only' });

  const handleTrack = async () => {
    const value = trackingNumber.replace(/\s/g, '');

    if (!/^\d{14}$/.test(value)) {
      setError('Номер накладної має складатися з 14 цифр');
      return;
    }

    setError(null);
    try {
      await track({ variables: { trackingNumber: value } });
    } catch (err) {
      setError(errorMessages(err)[0]);
    }
  };

  const waybill = data?.trackWaybill;

  return (
    <>
      <Field label="Номер накладної:" error={error}>
        <Input
          keyboardType="numeric"
          placeholder="59001234567890"
          value={trackingNumber}
          onChangeText={setTrackingNumber}
          onSubmitEditing={handleTrack}
          returnKeyType="search"
          maxLength={20}
          invalid={error !== null}
        />
      </Field>

      <MainButton title={loading ? 'Пошук...' : 'Відстежити'} onPress={handleTrack} loading={loading} />

      {called && !loading && !error && (waybill
        ? <Timeline waybill={waybill} />
        : (
          <ResultBox style={styles.empty}>
            <Text style={styles.emptyText}>Відправлення не знайдено</Text>
          </ResultBox>
        ))}
    </>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    empty: {
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    emptyText: {
      textAlign: 'center',
      color: c.muted,
      fontSize: 15,
    },
  });

import { useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { TRACK_WAYBILL } from '../graphql';
import { errorMessages } from '../format';
import Timeline from './timeline';
import { buttonRow, field, fieldError, input, mainButton, resultBox } from '../ui';

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [track, { data, loading, called }] = useLazyQuery(TRACK_WAYBILL, { fetchPolicy: 'network-only' });

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={handleTrack} noValidate>
      <div className={field}>
        <label htmlFor="tracking-number">Номер накладної:</label>
        <input
          id="tracking-number"
          type="text"
          inputMode="numeric"
          placeholder="59001234567890"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className={input}
          aria-invalid={error !== null}
        />
        {error && <p className={fieldError}>{error}</p>}
      </div>

      <div className={buttonRow}>
        <button type="submit" className={mainButton} disabled={loading}>
          {loading ? 'Пошук...' : 'Відстежити'}
        </button>
      </div>

      {called && !loading && !error && (waybill
        ? <Timeline waybill={waybill} />
        : <p className={`${resultBox} px-5 py-[15px] text-center text-muted`}>Відправлення не знайдено</p>)}
    </form>
  );
}

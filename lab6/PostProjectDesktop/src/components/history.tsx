import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { MY_WAYBILLS, type Waybill } from '../graphql';
import { errorMessages, formatDate } from '../format';
import Modal from './modal';
import Timeline from './timeline';
import { cardTitle, fieldError, smallButton, statusBadge } from '../ui';

type Filter = 'all' | 'transit' | 'received';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'transit', label: 'В дорозі' },
  { value: 'received', label: 'Отримані' },
];

const IN_TRANSIT: Waybill['status'][] = ['accepted', 'in_transit', 'arrived'];

const segmentButton = 'cursor-pointer bg-surface px-3.5 py-[7px] text-sm text-ink not-first:border-l not-first:border-line @max-[620px]:min-h-10 @max-[620px]:flex-1';

const searchInput =
  'min-w-50 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-3 focus:ring-accent-soft @max-[620px]:w-full @max-[620px]:min-w-0 @max-[620px]:flex-none @max-[620px]:py-2.5';

const headCell = 'border border-grid bg-thead px-2.5 py-[9px] text-left font-semibold text-thead-ink';

const bodyCell =
  'whitespace-nowrap border border-grid bg-surface-soft px-2.5 py-[9px] text-left @max-[620px]:flex @max-[620px]:w-full @max-[620px]:items-center @max-[620px]:justify-between @max-[620px]:gap-3 @max-[620px]:border-0 @max-[620px]:border-b @max-[620px]:bg-transparent @max-[620px]:px-3 @max-[620px]:text-right @max-[620px]:whitespace-normal @max-[620px]:before:text-left @max-[620px]:before:text-[0.85rem] @max-[620px]:before:text-muted @max-[620px]:before:content-[attr(data-label)]';

const emptyCell = 'border border-grid bg-surface-soft px-2.5 py-[9px] text-center text-muted @max-[620px]:block @max-[620px]:border-0';

function matchesFilter(waybill: Waybill, filter: Filter) {
  if (filter === 'transit') return IN_TRANSIT.includes(waybill.status);
  if (filter === 'received') return waybill.status === 'received';
  return true;
}

export default function History() {
  const [filter, setFilter] = useState<Filter>('all');
  const [onlyActive, setOnlyActive] = useState(false);
  const [search, setSearch] = useState('');
  const [tracked, setTracked] = useState<Waybill | null>(null);
  const { data, loading, error } = useQuery(MY_WAYBILLS, { fetchPolicy: 'cache-and-network' });

  const query = search.replace(/\s/g, '');
  const waybills = (data?.myWaybills ?? []).filter((waybill) =>
    matchesFilter(waybill, filter)
    && (!onlyActive || waybill.status !== 'received')
    && waybill.trackingNumber.includes(query)
  );

  return (
    <section>
      <h2 className={cardTitle}>Історія відправлень</h2>

      <div className="mb-5 flex flex-wrap items-center gap-[15px] @max-[620px]:flex-col @max-[620px]:items-stretch @max-[620px]:gap-3">
        <div className="inline-flex overflow-hidden rounded-md border border-line @max-[620px]:flex" role="group" aria-label="Фільтр за статусом">
          {FILTERS.map((item) => (
            <button key={item.value} type="button" className={`${segmentButton} ${filter === item.value ? 'bg-accent! text-white!' : ''}`} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
              {item.label}
            </button>
          ))}
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm @max-[620px]:justify-between">
          Лише активні
          <input type="checkbox" role="switch" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} className="peer sr-only" />
          <span className="relative h-[22px] w-10 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-[18px]" aria-hidden="true"></span>
        </label>

        <input
          type="search"
          className={searchInput}
          placeholder="Пошук за номером накладної"
          aria-label="Пошук за номером накладної"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className={fieldError}>{errorMessages(error)[0]}</p>}

      <div className="overflow-x-auto @max-[620px]:overflow-visible">
        <table className="w-full border-collapse text-sm @max-[620px]:block">
          <thead className="@max-[620px]:sr-only">
            <tr>
              <th className={headCell}>Номер накладної</th>
              <th className={headCell}>Дата</th>
              <th className={headCell}>Маршрут</th>
              <th className={headCell}>Вартість</th>
              <th className={headCell}>Статус</th>
              <th className={headCell}><span className="sr-only">Дія</span></th>
            </tr>
          </thead>
          <tbody className="@max-[620px]:block">
            {waybills.map((waybill) => (
              <tr key={waybill.id} className="@max-[620px]:mb-3 @max-[620px]:block @max-[620px]:overflow-hidden @max-[620px]:rounded-lg @max-[620px]:border @max-[620px]:border-grid @max-[620px]:bg-surface-soft">
                <td data-label="Номер накладної" className={`${bodyCell} @max-[620px]:font-semibold`}>{waybill.trackingNumber}</td>
                <td data-label="Дата" className={bodyCell}>{formatDate(waybill.createdAt)}</td>
                <td data-label="Маршрут" className={bodyCell}>{waybill.cityFrom} ➔ {waybill.cityTo}</td>
                <td data-label="Вартість" className={bodyCell}>{waybill.cost} ₴</td>
                <td data-label="Статус" className={bodyCell}><span className={statusBadge(waybill.status)}>{waybill.statusTitle}</span></td>
                <td className={`${bodyCell} @max-[620px]:border-b-0`}><button type="button" className={`${smallButton} @max-[620px]:min-h-10 @max-[620px]:w-full`} onClick={() => setTracked(waybill)}>Відстежити</button></td>
              </tr>
            ))}
            {!loading && waybills.length === 0 && (
              <tr>
                <td colSpan={6} className={emptyCell}>Відправлень не знайдено</td>
              </tr>
            )}
            {loading && !data && (
              <tr>
                <td colSpan={6} className={emptyCell}>Завантаження...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tracked && (
        <Modal title={`Накладна ${tracked.trackingNumber}`} onClose={() => setTracked(null)}>
          <Timeline waybill={tracked} />
        </Modal>
      )}
    </section>
  );
}

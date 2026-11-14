import type { Waybill } from '../graphql';
import { formatDate, formatDateTime } from '../format';
import { resultBox, statusBadge } from '../ui';

const DELIVERED: Waybill['status'][] = ['arrived', 'received'];

export default function Timeline({ waybill }: { waybill: Waybill }) {
  const delivered = DELIVERED.includes(waybill.status);

  return (
    <div className={`${resultBox} px-5 pt-[18px] pb-2`}>
      <div className="mb-[15px] flex items-center justify-between gap-2.5">
        <strong>Статус посилки:</strong>
        <span className={statusBadge(waybill.status)}>{waybill.statusTitle}</span>
      </div>

      <ul>
        {waybill.events.map((event) => (
          <li key={event.id} className="relative mb-3.5 pl-[26px] before:absolute before:top-1 before:left-0 before:size-3 before:rounded-full before:border-2 before:border-accent before:content-[''] before:bg-accent">
            <span>{formatDateTime(event.eventTime)} – {event.title}</span>
            {event.branch && <small className="mt-[3px] block text-[0.8rem] text-muted">{event.branch.title}</small>}
          </li>
        ))}

        {waybill.events.length === 0 && (
          <li className="relative mb-3.5 pl-[26px] before:absolute before:top-1 before:left-0 before:size-3 before:rounded-full before:border-2 before:border-accent before:content-[''] before:bg-accent">
            <span>{formatDateTime(waybill.createdAt)} – Створено накладну</span>
            <small className="mt-[3px] block text-[0.8rem] text-muted">{waybill.cityFrom} ➔ {waybill.cityTo}</small>
          </li>
        )}

        {!delivered && (
          <li className="relative mb-3.5 pl-[26px] before:absolute before:top-1 before:left-0 before:size-3 before:rounded-full before:border-2 before:border-accent before:content-[''] before:bg-surface">
            <span>Очікується {formatDate(waybill.expectedAt)} – Прибуло у відділення</span>
            <small className="mt-[3px] block text-[0.8rem] text-muted">{waybill.toBranch?.title ?? waybill.cityTo}</small>
          </li>
        )}
      </ul>
    </div>
  );
}

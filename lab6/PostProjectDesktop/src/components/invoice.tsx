import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { BRANCHES, CREATE_WAYBILL, MY_WAYBILLS, type DeliveryType, type Waybill } from '../graphql';
import { daysLabel, errorMessages } from '../format';
import { buttonRow, cardTitle, checkbox, checkboxLabel, errorList, field, hint, input, linkButton, mainButton, resultBox, select, wideCard } from '../ui';

type Tab = 'people' | 'parcel';

const activeTab = 'border-accent bg-accent text-white';

const idleTab = 'border-line text-ink';

const radioLabel = 'mr-5 inline-flex cursor-pointer items-center gap-1.5 py-2.5';

export default function Invoice({ onOpenCabinet }: { onOpenCabinet: () => void }) {
  const [tab, setTab] = useState<Tab>('people');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [fromBranchId, setFromBranchId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [weight, setWeight] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<Waybill | null>(null);

  const { data: branchesData, loading: branchesLoading } = useQuery(BRANCHES);
  const [createWaybill, { loading }] = useMutation(CREATE_WAYBILL, { refetchQueries: [MY_WAYBILLS] });

  const branches = branchesData?.branches ?? [];

  const generateTTN = async (e: React.FormEvent) => {
    e.preventDefault();

    const weightKg = parseFloat(weight.replace(',', '.'));
    if (!lastName.trim() || !firstName.trim() || !phone.trim() || !fromBranchId || !toBranchId) {
      setTab('people');
      setErrors(['Заповніть усі поля вкладки «Відправник та отримувач»']);
      return;
    }
    if (isNaN(weightKg)) {
      setTab('parcel');
      setErrors(['Вкажіть вагу посилки на вкладці «Посилка»']);
      return;
    }

    setErrors([]);
    try {
      const { data } = await createWaybill({
        variables: { input: { lastName, firstName, phone, fromBranchId, toBranchId, weightKg, deliveryType } },
      });
      if (data) setCreated(data.createWaybill);
    } catch (err) {
      setErrors(errorMessages(err));
    }
  };

  const branchOptions = (
    <>
      <option value="" disabled>{branchesLoading ? 'Завантаження...' : 'Оберіть відділення'}</option>
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>{branch.title}</option>
      ))}
    </>
  );

  return (
    <div className={wideCard}>
      <section>
        <h2 className={cardTitle}>Створення електронної накладної</h2>

        <div className="mb-5 flex gap-1 border-b-2 border-line" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'people'} className={`cursor-pointer rounded-t-md border border-b-0 px-3.5 py-2 text-[0.95rem] max-sm:flex-1 max-sm:px-1.5 max-sm:text-[0.85rem] ${tab === 'people' ? activeTab : idleTab}`} onClick={() => setTab('people')}>
            Відправник та отримувач
          </button>
          <button type="button" role="tab" aria-selected={tab === 'parcel'} className={`cursor-pointer rounded-t-md border border-b-0 px-3.5 py-2 text-[0.95rem] max-sm:flex-1 max-sm:px-1.5 max-sm:text-[0.85rem] ${tab === 'parcel' ? activeTab : idleTab}`} onClick={() => setTab('parcel')}>
            Посилка
          </button>
        </div>

        <form onSubmit={generateTTN} noValidate>
          {tab === 'people' && (
            <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1">
              <div className={field}>
                <label htmlFor="lastName">Прізвище:</label>
                <input id="lastName" type="text" placeholder="Прізвище" value={lastName} onChange={(e) => setLastName(e.target.value)} className={input} />
              </div>

              <div className={field}>
                <label htmlFor="firstName">Ім'я:</label>
                <input id="firstName" type="text" placeholder="Ім'я" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={input} />
              </div>

              <div className={field}>
                <label htmlFor="cityA">Місто відправлення:</label>
                <select id="cityA" value={fromBranchId} onChange={(e) => setFromBranchId(e.target.value)} className={select}>
                  {branchOptions}
                </select>
              </div>

              <div className={field}>
                <label htmlFor="cityB">Місто отримання:</label>
                <select id="cityB" value={toBranchId} onChange={(e) => setToBranchId(e.target.value)} className={select}>
                  {branchOptions}
                </select>
              </div>

              <div className={field}>
                <label htmlFor="phone">Номер телефону:</label>
                <input id="phone" type="tel" placeholder="+380 50 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
              </div>

              <fieldset className={field}>
                <legend className="mb-2">Тип доставки:</legend>
                <label className={radioLabel}>
                  <input type="radio" className="accent-accent" name="deliveryType" value="standard" checked={deliveryType === 'standard'} onChange={() => setDeliveryType('standard')} />
                  Стандартна
                </label>
                <label className={radioLabel}>
                  <input type="radio" className="accent-accent" name="deliveryType" value="express" checked={deliveryType === 'express'} onChange={() => setDeliveryType('express')} />
                  Експрес
                </label>
              </fieldset>
            </div>
          )}

          {tab === 'parcel' && (
            <div className={field}>
              <label htmlFor="weightKg">Вага посилки (кг):</label>
              <input id="weightKg" type="number" min="0.1" step="0.1" placeholder="2,5" value={weight} onChange={(e) => setWeight(e.target.value)} className={input} />
              <p className={hint}>Вартість і дні доставки розраховуються за тарифом і відстанню між відділеннями.</p>
            </div>
          )}

          <label className={checkboxLabel}>
            <input type="checkbox" className={checkbox} checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            Підтверджую правильність введених даних
          </label>

          {errors.length > 0 && (
            <ul className={errorList}>
              {errors.map((message) => <li key={message}>{message}</li>)}
            </ul>
          )}

          <div className={buttonRow}>
            <button type="submit" className={mainButton} disabled={!confirmed || loading}>
              {loading ? 'Створення...' : 'Згенерувати номер накладної'}
            </button>
          </div>
        </form>

        {created && (
          <div className={`${resultBox} mx-auto max-w-105 px-7.5 py-[15px] text-center max-sm:px-[15px]`}>
            <p className="mb-2 text-sm leading-normal text-muted">Ваш новий трек-номер для <strong className="text-ink">{created.firstName} {created.lastName}</strong>:</p>
            <strong className="mb-2 block text-2xl tracking-[2px] text-accent">{created.trackingNumber}</strong>
            <p className="mb-2 text-sm leading-normal text-muted">
              Маршрут: {created.cityFrom} ➔ {created.cityTo} <br/>
              Контакт: {created.phone} <br/>
              Вартість: {created.cost} ₴, у дорозі {daysLabel(created.days)}
            </p>
            <button type="button" className={linkButton} onClick={onOpenCabinet}>Переглянути в особистому кабінеті</button>
          </div>
        )}
      </section>
    </div>
  );
}

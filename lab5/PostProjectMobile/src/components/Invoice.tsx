import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@apollo/client/react';
import { BRANCHES, CREATE_WAYBILL, MY_WAYBILLS, type DeliveryType, type Waybill } from '../graphql';
import { daysLabel, errorMessages } from '../format';
import { notify } from '../notify';
import { useStyles, type Palette } from '../theme';
import { Card, Checkbox, ErrorList, Field, Input, LinkButton, MainButton, ResultBox, Segmented, Select } from './ui';

type Tab = 'people' | 'parcel';

const TABS: { value: Tab; label: string }[] = [
  { value: 'people', label: 'Відправник та отримувач' },
  { value: 'parcel', label: 'Посилка' },
];

const DELIVERY_OPTIONS: { value: DeliveryType; label: string }[] = [
  { value: 'standard', label: 'Стандартна' },
  { value: 'express', label: 'Експрес' },
];

export default function Invoice({ onOpenCabinet }: { onOpenCabinet: () => void }) {
  const styles = useStyles(createStyles);
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

  const branchOptions = (branchesData?.branches ?? []).map((branch) => ({ value: branch.id, label: branch.title }));
  const branchPlaceholder = branchesLoading ? 'Завантаження...' : 'Оберіть відділення';

  const showErrors = (messages: string[]) => {
    setErrors(messages);
    notify('Помилка', messages.join('\n'));
  };

  const generateTTN = async () => {
    const weightKg = parseFloat(weight.replace(',', '.'));
    if (!lastName.trim() || !firstName.trim() || !phone.trim() || !fromBranchId || !toBranchId) {
      setTab('people');
      showErrors(['Заповніть усі поля вкладки «Відправник та отримувач»']);
      return;
    }
    if (isNaN(weightKg)) {
      setTab('parcel');
      showErrors(['Вкажіть вагу посилки на вкладці «Посилка»']);
      return;
    }

    setErrors([]);
    try {
      const { data } = await createWaybill({
        variables: { input: { lastName, firstName, phone, fromBranchId, toBranchId, weightKg, deliveryType } },
      });
      if (data) {
        setCreated(data.createWaybill);
        notify('Накладну створено', `Номер накладної: ${data.createWaybill.trackingNumber}`);
      }
    } catch (err) {
      showErrors(errorMessages(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card title="Створення електронної накладної">
        <View style={styles.tabs}>
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>

        {tab === 'people' && (
          <>
            <Field label="Прізвище:">
              <Input placeholder="Прізвище" value={lastName} onChangeText={setLastName} autoComplete="family-name" />
            </Field>
            <Field label="Ім'я:">
              <Input placeholder="Ім'я" value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
            </Field>
            <Field label="Місто відправлення:">
              <Select value={fromBranchId} options={branchOptions} placeholder={branchPlaceholder} onChange={setFromBranchId} />
            </Field>
            <Field label="Місто отримання:">
              <Select value={toBranchId} options={branchOptions} placeholder={branchPlaceholder} onChange={setToBranchId} />
            </Field>
            <Field label="Номер телефону:">
              <Input keyboardType="phone-pad" placeholder="+380 50 000 00 00" value={phone} onChangeText={setPhone} autoComplete="tel" />
            </Field>
            <Field label="Тип доставки:">
              <Segmented options={DELIVERY_OPTIONS} value={deliveryType} onChange={setDeliveryType} />
            </Field>
          </>
        )}

        {tab === 'parcel' && (
          <Field label="Вага посилки (кг):" hint="Вартість і дні доставки розраховуються за тарифом і відстанню між відділеннями.">
            <Input keyboardType="numeric" placeholder="2,5" value={weight} onChangeText={setWeight} />
          </Field>
        )}

        <Checkbox checked={confirmed} onChange={setConfirmed} label="Підтверджую правильність введених даних" />

        <ErrorList errors={errors} />

        <MainButton
          title={loading ? 'Створення...' : 'Згенерувати номер накладної'}
          onPress={generateTTN}
          disabled={!confirmed}
          loading={loading}
        />

        {created && (
          <ResultBox style={styles.created}>
            <Text style={styles.createdText}>
              Ваш новий трек-номер для <Text style={styles.createdName}>{created.firstName} {created.lastName}</Text>:
            </Text>
            <Text style={styles.trackingNumber} selectable>{created.trackingNumber}</Text>
            <Text style={styles.createdText}>Маршрут: {created.cityFrom} ➔ {created.cityTo}</Text>
            <Text style={styles.createdText}>Контакт: {created.phone}</Text>
            <Text style={[styles.createdText, styles.lastLine]}>Вартість: {created.cost} ₴, у дорозі {daysLabel(created.days)}</Text>
            <LinkButton title="Переглянути в особистому кабінеті" onPress={onOpenCabinet} />
          </ResultBox>
        )}
      </Card>
    </ScrollView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      padding: 16,
    },
    tabs: {
      marginBottom: 20,
    },
    created: {
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 15,
    },
    createdText: {
      fontSize: 14,
      lineHeight: 21,
      color: c.muted,
      textAlign: 'center',
    },
    createdName: {
      fontWeight: 'bold',
      color: c.ink,
    },
    trackingNumber: {
      marginVertical: 8,
      fontSize: 24,
      fontWeight: 'bold',
      letterSpacing: 2,
      color: c.accent,
    },
    lastLine: {
      marginBottom: 10,
    },
  });

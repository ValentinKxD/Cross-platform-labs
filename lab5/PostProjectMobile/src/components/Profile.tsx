import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { UPDATE_PROFILE } from '../graphql';
import { errorMessages } from '../format';
import { useAuth } from '../auth/AuthContext';
import { notify } from '../notify';
import { useStyles, type Palette } from '../theme';
import { ErrorList, Field, Input, MainButton } from './ui';

export default function Profile() {
  const styles = useStyles(createStyles);
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  const handleSubmit = async () => {
    setErrors([]);
    setSaved(false);

    try {
      const { data } = await updateProfile({ variables: { name, email, phone: phone.trim() || null } });
      if (data) {
        setPhone(data.updateProfile.phone ?? '');
        setSaved(true);
        notify('Збережено', 'Дані профілю збережено');
      }
    } catch (err) {
      setErrors(errorMessages(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Профіль</Text>

      <Field label="Ім'я та прізвище:">
        <Input value={name} onChangeText={setName} autoComplete="name" />
      </Field>
      <Field label="Email:">
        <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      </Field>
      <Field label="Номер телефону:">
        <Input keyboardType="phone-pad" placeholder="+380 50 000 00 00" value={phone} onChangeText={setPhone} autoComplete="tel" />
      </Field>

      <ErrorList errors={errors} />
      {saved && <Text style={styles.success}>Дані профілю збережено</Text>}

      <MainButton title={loading ? 'Збереження...' : 'Зберегти зміни'} onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      padding: 16,
      width: '100%',
      maxWidth: 500,
      alignSelf: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: c.heading,
      marginBottom: 16,
    },
    success: {
      marginBottom: 14,
      color: c.success,
    },
  });

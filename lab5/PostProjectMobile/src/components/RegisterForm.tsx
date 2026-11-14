import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { REGISTER } from '../graphql';
import { errorMessages } from '../format';
import { useAuth } from '../auth/AuthContext';
import { useStyles, type Palette } from '../theme';
import { ErrorList, Field, Input, LinkButton, MainButton } from './ui';

export default function RegisterForm({ onShowLogin }: { onShowLogin: () => void }) {
  const styles = useStyles(createStyles);
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [register, { loading }] = useMutation(REGISTER);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setErrors(["Заповніть ім'я, email і пароль"]);
      return;
    }
    if (password !== passwordRepeat) {
      setErrors(['Паролі не збігаються']);
      return;
    }

    setErrors([]);
    try {
      const { data } = await register({ variables: { name, email: email.trim(), phone: phone.trim() || null, password } });
      if (data) signIn(data.register.token, data.register.user, false);
    } catch (err) {
      setErrors(errorMessages(err));
    }
  };

  return (
    <View>
      <Field label="Ім'я та прізвище:">
        <Input placeholder="Ім'я Прізвище" value={name} onChangeText={setName} autoComplete="name" />
      </Field>
      <Field label="Email:">
        <Input placeholder="user@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      </Field>
      <Field label="Номер телефону:" hint="Необов'язково. За номером телефону теж можна буде входити.">
        <Input keyboardType="phone-pad" placeholder="+380 50 000 00 00" value={phone} onChangeText={setPhone} autoComplete="tel" />
      </Field>
      <Field label="Пароль:">
        <Input secureTextEntry placeholder="Щонайменше 6 символів" value={password} onChangeText={setPassword} autoComplete="new-password" />
      </Field>
      <Field label="Повторіть пароль:">
        <Input secureTextEntry value={passwordRepeat} onChangeText={setPasswordRepeat} invalid={errors.length > 0} autoComplete="new-password" />
      </Field>

      <ErrorList errors={errors} />

      <MainButton title={loading ? 'Реєстрація...' : 'Зареєструватися'} onPress={handleSubmit} loading={loading} />

      <View style={styles.login}>
        <Text style={styles.text}>Вже маєте обліковий запис? </Text>
        <LinkButton title="Увійти" onPress={onShowLogin} />
      </View>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    login: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 15,
      color: c.ink,
    },
  });

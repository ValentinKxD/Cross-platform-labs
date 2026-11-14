import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { LOGIN } from '../graphql';
import { errorMessages } from '../format';
import { useAuth } from '../auth/AuthContext';
import { useStyles, type Palette } from '../theme';
import AppModal from './AppModal';
import RegisterForm from './RegisterForm';
import { Checkbox, Field, Input, LinkButton, MainButton } from './ui';

export default function LoginModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles(createStyles);
  const { signIn } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMutation, { loading }] = useMutation(LOGIN);

  const handleSubmit = async () => {
    if (!login.trim() || !password) {
      setError('Вкажіть email або телефон і пароль');
      return;
    }
    setError(null);

    try {
      const { data } = await loginMutation({ variables: { login: login.trim(), password, remember } });
      if (data) signIn(data.login.token, data.login.user, remember);
    } catch (err) {
      setError(errorMessages(err)[0]);
    }
  };

  if (mode === 'register') {
    return (
      <AppModal visible={visible} title="Реєстрація" onClose={onClose}>
        <RegisterForm onShowLogin={() => setMode('login')} />
      </AppModal>
    );
  }

  return (
    <AppModal visible={visible} title="Вхід до особистого кабінету" onClose={onClose}>
      <Field label="Email або номер телефону:">
        <Input
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="email-address"
          placeholder="user@example.com"
          value={login}
          onChangeText={setLogin}
          returnKeyType="next"
        />
      </Field>

      <Field label="Пароль:" error={error}>
        <Input
          secureTextEntry
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          invalid={error !== null}
        />
      </Field>

      <Checkbox checked={remember} onChange={setRemember} label="Запам'ятати мене" />

      <MainButton title={loading ? 'Вхід...' : 'Увійти'} onPress={handleSubmit} loading={loading} />

      <View style={styles.center}>
        <LinkButton title="Забули пароль?" onPress={() => setShowHint(true)} />
      </View>
      {showHint && (
        <Text style={styles.hint}>Відновлення пароля поки недоступне. Зверніться до служби підтримки PostProject.</Text>
      )}

      <View style={styles.register}>
        <Text style={styles.text}>Немає облікового запису? </Text>
        <LinkButton title="Зареєструватися" onPress={() => setMode('register')} />
      </View>
    </AppModal>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    center: {
      alignItems: 'center',
      marginBottom: 8,
    },
    hint: {
      fontSize: 14,
      color: c.muted,
      textAlign: 'center',
    },
    register: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.grid,
    },
    text: {
      fontSize: 15,
      color: c.ink,
    },
  });

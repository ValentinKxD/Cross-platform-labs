import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { confirmAction } from '../notify';
import { useStyles, type Palette } from '../theme';
import History from './History';
import Profile from './Profile';
import { Segmented } from './ui';

type Section = 'profile' | 'history';

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'history', label: 'Історія відправлень' },
  { value: 'profile', label: 'Профіль' },
];

export default function Cabinet({ onCreate, onSignOut }: { onCreate: () => void; onSignOut: () => void }) {
  const styles = useStyles(createStyles);
  const { user, signOut } = useAuth();
  const [section, setSection] = useState<Section>('history');

  const handleSignOut = () => {
    confirmAction('Вихід', 'Вийти з особистого кабінету?', 'Вийти', () => {
      signOut();
      onSignOut();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        <Text style={styles.greeting} numberOfLines={1}>Особистий кабінет · {user?.name}</Text>
        <Segmented options={SECTIONS} value={section} onChange={setSection} />
        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={onCreate}>
            <Text style={styles.actionText}>Створити накладну</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={handleSignOut}>
            <Text style={[styles.actionText, styles.signOut]}>Вийти</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {section === 'history' ? <History /> : <Profile />}
      </View>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    menu: {
      gap: 10,
      backgroundColor: c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    greeting: {
      fontSize: 16,
      fontWeight: '600',
      color: c.ink,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    action: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 6,
      backgroundColor: c.surface,
    },
    actionText: {
      fontSize: 14,
      color: c.ink,
    },
    signOut: {
      color: c.danger,
    },
  });

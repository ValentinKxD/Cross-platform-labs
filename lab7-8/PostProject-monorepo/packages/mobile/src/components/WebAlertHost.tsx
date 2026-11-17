import { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { setWebDialogListener, type Dialog } from '../notify';
import { useStyles, type Palette } from '../theme';

export default function WebAlertHost() {
  const styles = useStyles(createStyles);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    setWebDialogListener(setDialog);
    return () => setWebDialogListener(null);
  }, []);

  if (!dialog) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setDialog(null)}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{dialog.title}</Text>
          <Text style={styles.message}>{dialog.message}</Text>
          <View style={styles.buttons}>
            {dialog.buttons.map((button) => (
              <TouchableOpacity
                key={button.text}
                style={styles.button}
                onPress={() => {
                  setDialog(null);
                  button.onPress?.();
                }}
              >
                <Text style={[styles.buttonText, button.style === 'destructive' && styles.destructive]}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      padding: 32,
    },
    dialog: {
      width: '100%',
      maxWidth: 320,
      borderRadius: 24,
      backgroundColor: c.surface,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 12,
      elevation: 8,
    },
    title: {
      fontSize: 20,
      color: c.ink,
      marginBottom: 14,
    },
    message: {
      fontSize: 15,
      lineHeight: 21,
      color: c.muted,
      marginBottom: 12,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    button: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.accent,
    },
    destructive: {
      color: c.danger,
    },
  });

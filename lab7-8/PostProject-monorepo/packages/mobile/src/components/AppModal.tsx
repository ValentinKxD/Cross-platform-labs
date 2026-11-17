import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStyles, type Palette } from '../theme';

export default function AppModal({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const styles = useStyles(createStyles);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.dialog}>
            <View style={styles.head}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity style={styles.close} onPress={onClose} accessibilityLabel="Закрити" hitSlop={8}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      padding: 16,
    },
    dialog: {
      width: '100%',
      maxWidth: 440,
      maxHeight: '90%',
      alignSelf: 'center',
      borderRadius: 10,
      backgroundColor: c.surface,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: c.grid,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: 'bold',
      color: c.ink,
    },
    close: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: 28,
      lineHeight: 30,
      color: c.ink,
    },
    body: {
      padding: 20,
    },
  });

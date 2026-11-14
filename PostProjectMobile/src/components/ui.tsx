import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useStyles, useTheme, type Palette } from '../theme';


export function Card({ title, children, style }: { title?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string | null; hint?: string; children: ReactNode }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Input({ invalid, style, ...props }: TextInputProps & { invalid?: boolean }) {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={[styles.input, focused && styles.inputFocused, invalid && styles.inputInvalid, style]}
    />
  );
}

export function MainButton({ title, onPress, disabled, loading }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const inactive = disabled || loading;

  return (
    <TouchableOpacity style={[styles.mainButton, inactive && styles.buttonDisabled]} onPress={onPress} disabled={inactive} activeOpacity={0.7}>
      {loading && <ActivityIndicator color={colors.accent} style={styles.spinner} />}
      <Text style={styles.mainButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function LinkButton({ title, onPress }: { title: string; onPress: () => void }) {
  const styles = useStyles(createStyles);
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8}>
      <Text style={styles.link}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  const styles = useStyles(createStyles);
  return (
    <TouchableOpacity style={styles.checkRow} onPress={() => onChange(!checked)} activeOpacity={0.7} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (value: T) => void }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.segmented}>
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segment, index > 0 && styles.segmentBorder, active && styles.segmentActive]}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={2}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function Select({ value, options, placeholder, onChange }: { value: string; options: Option<string>[]; placeholder: string; onChange: (value: string) => void }) {
  const styles = useStyles(createStyles);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <TouchableOpacity style={[styles.input, styles.select]} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={selected ? styles.selectText : styles.selectPlaceholder} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.selectSheet}>
            <Text style={styles.selectTitle}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.hint}>Список порожній</Text>}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function ErrorList({ errors }: { errors: string[] }) {
  const styles = useStyles(createStyles);
  if (errors.length === 0) return null;
  return (
    <View style={styles.errorList}>
      {errors.map((message) => (
        <Text key={message} style={styles.fieldError}>• {message}</Text>
      ))}
    </View>
  );
}

export function StatusBadge({ status, title }: { status: string; title: string }) {
  const styles = useStyles(createStyles);
  const received = status === 'received';
  return (
    <View style={[styles.badge, received && styles.badgeMuted]}>
      <Text style={[styles.badgeText, received && styles.badgeTextMuted]}>{title}</Text>
    </View>
  );
}

export function ResultBox({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles(createStyles);
  return <View style={[styles.resultBox, style]}>{children}</View>;
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      width: '100%',
      maxWidth: 700,
      alignSelf: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 20,
      marginBottom: 16,
      shadowColor: c.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: c.heading,
      marginBottom: 16,
    },
    field: {
      marginBottom: 16,
      gap: 8,
    },
    label: {
      fontSize: 16,
      color: c.ink,
    },
    input: {
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 6,
      backgroundColor: c.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: c.ink,
    },
    inputFocused: {
      borderColor: c.accent,
    },
    inputInvalid: {
      borderColor: c.danger,
    },
    fieldError: {
      fontSize: 14,
      color: c.danger,
    },
    hint: {
      fontSize: 14,
      color: c.muted,
    },
    mainButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 50,
      borderWidth: 2,
      borderColor: c.accent,
      borderRadius: 6,
      backgroundColor: c.surface,
      padding: 10,
      marginBottom: 16,
    },
    mainButtonText: {
      fontSize: 18,
      color: c.ink,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    spinner: {
      marginRight: 8,
    },
    link: {
      fontSize: 15,
      color: c.accent,
      textDecorationLine: 'underline',
    },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
      minHeight: 32,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: c.line,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    checkMark: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: 'bold',
    },
    checkLabel: {
      flex: 1,
      fontSize: 15,
      color: c.ink,
    },
    segmented: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 6,
      overflow: 'hidden',
    },
    segment: {
      flex: 1,
      minHeight: 42,
      paddingHorizontal: 6,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
    },
    segmentBorder: {
      borderLeftWidth: 1,
      borderLeftColor: c.line,
    },
    segmentActive: {
      backgroundColor: c.accent,
    },
    segmentText: {
      fontSize: 14,
      color: c.ink,
      textAlign: 'center',
    },
    segmentTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    select: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    selectText: {
      flex: 1,
      fontSize: 16,
      color: c.ink,
    },
    selectPlaceholder: {
      flex: 1,
      fontSize: 16,
      color: c.muted,
    },
    selectArrow: {
      fontSize: 16,
      color: c.ink,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      justifyContent: 'center',
      padding: 16,
    },
    selectSheet: {
      maxHeight: '75%',
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
      borderRadius: 10,
      backgroundColor: c.surface,
      paddingVertical: 8,
    },
    selectTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: c.ink,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.grid,
    },
    option: {
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    optionActive: {
      backgroundColor: c.accentSoft,
    },
    optionText: {
      fontSize: 16,
      color: c.ink,
    },
    errorList: {
      marginBottom: 14,
      gap: 4,
    },
    badge: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: c.accent,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 2,
    },
    badgeMuted: {
      borderColor: c.muted,
    },
    badgeText: {
      fontSize: 14,
      color: c.accent,
    },
    badgeTextMuted: {
      color: c.muted,
    },
    resultBox: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: c.accent,
      borderRadius: 6,
      backgroundColor: c.surfaceSoft,
    },
  });

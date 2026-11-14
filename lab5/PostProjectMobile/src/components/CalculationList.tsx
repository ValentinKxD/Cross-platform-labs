import type { ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Calculation } from '../calculations';
import { useStyles, type Palette } from '../theme';
import CalculationItem from './CalculationItem';

interface CalculationListProps {
  calculations: Calculation[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  header?: ReactElement;
}

export default function CalculationList({ calculations, onToggle, onDelete, header }: CalculationListProps) {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <FlatList
        data={calculations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CalculationItem calculation={item} onToggle={onToggle} onDelete={onDelete} />}
        ListHeaderComponent={
          <>
            {header}
            <Text style={styles.sectionTitle}>Історія розрахунків</Text>
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>Розрахунків поки немає. Зробіть перший!</Text>}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      width: '100%',
      maxWidth: 700,
      alignSelf: 'center',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: c.heading,
      marginBottom: 12,
    },
    empty: {
      fontSize: 16,
      color: c.muted,
      textAlign: 'center',
      marginTop: 12,
    },
  });

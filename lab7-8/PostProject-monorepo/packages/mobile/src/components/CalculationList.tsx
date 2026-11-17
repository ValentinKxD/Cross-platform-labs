import type { ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Calculation } from '@postproject/core';
import { useStyles, type Palette } from '../theme';
import CalculationItem from './CalculationItem';

interface CalculationListProps {
  calculations: Calculation[];
  emptyText: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  header?: ReactElement;
  search?: ReactElement;
}

export default function CalculationList({ calculations, emptyText, onToggle, onDelete, header, search }: CalculationListProps) {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <FlatList
        data={calculations}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <CalculationItem calculation={item} onToggle={onToggle} onDelete={onDelete} />}
        ListHeaderComponent={
          <>
            {header}
            <Text style={styles.sectionTitle}>Історія розрахунків</Text>
            {search}
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
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

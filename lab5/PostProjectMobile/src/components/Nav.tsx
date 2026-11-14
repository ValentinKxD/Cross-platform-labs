import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { useStyles, useTheme, type Palette } from '../theme';

export type Page = 'home' | 'calculator' | 'create' | 'cabinet';

const LINKS: { page: Page; label: string }[] = [
  { page: 'home', label: 'Головна' },
  { page: 'calculator', label: 'Калькулятор' },
  { page: 'create', label: 'Накладна' },
  { page: 'cabinet', label: 'Кабінет' },
];

function TabIcon({ page, color }: { page: Page; color: string }) {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (page) {
    case 'home':
      return (
        <Svg {...props}>
          <Path d="M5 12H3l9-9 9 9h-2" />
          <Path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          <Path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
        </Svg>
      );
    case 'calculator':
      return (
        <Svg {...props}>
          <Rect x="4" y="3" width="16" height="18" rx="2" />
          <Rect x="8" y="7" width="8" height="3" rx="1" />
          <Path d="M8 14v.01M12 14v.01M16 14v.01M8 17v.01M12 17v.01M16 17v.01" />
        </Svg>
      );
    case 'create':
      return (
        <Svg {...props}>
          <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <Path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
          <Path d="M12 11v6M9 14h6" />
        </Svg>
      );
    case 'cabinet':
      return (
        <Svg {...props}>
          <Path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0" />
          <Path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </Svg>
      );
  }
}

export default function Nav({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const compact = useWindowDimensions().width < 360;

  return (
    <View style={[styles.nav, { paddingBottom: insets.bottom + 6 }]} accessibilityRole="tablist">
      {LINKS.map((link) => {
        const active = page === link.page;
        const color = active ? colors.accent : colors.muted;
        return (
          <TouchableOpacity
            key={link.page}
            style={styles.tab}
            onPress={() => onNavigate(link.page)}
            accessibilityRole="tab"
            accessibilityLabel={link.label}
            accessibilityState={{ selected: active }}
            activeOpacity={0.7}
          >
            <TabIcon page={link.page} color={color} />
            <Text style={[styles.label, compact && styles.labelCompact, { color }, active && styles.labelActive]} numberOfLines={1}>
              {link.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    nav: {
      flexDirection: 'row',
      backgroundColor: c.nav,
      borderTopWidth: 1,
      borderTopColor: c.line,
      paddingTop: 6,
      paddingHorizontal: 4,
    },
    tab: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    label: {
      fontSize: 12,
    },
    labelCompact: {
      fontSize: 10,
    },
    labelActive: {
      fontWeight: '600',
    },
  });

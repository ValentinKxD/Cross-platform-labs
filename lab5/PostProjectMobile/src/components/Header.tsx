import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { fonts, useStyles, useTheme, type Palette } from '../theme';

export default function Header() {
  const styles = useStyles(createStyles);
  const { theme, colors, toggleTheme } = useTheme();
  const compact = useWindowDimensions().width < 360;
  const logoSize = compact ? 20 : 24;
  const icon = { stroke: colors.ink, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={[styles.logo, compact && styles.logoCompact]}>
        <Svg width={logoSize} height={logoSize} viewBox="0 0 24 24" {...icon}>
          <Rect x="1" y="3" width="15" height="13" />
          <Polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <Circle cx="5.5" cy="18.5" r="2.5" />
          <Circle cx="18.5" cy="18.5" r="2.5" />
        </Svg>
        <Text style={[styles.title, compact && styles.titleCompact]}>PostProject</Text>
        <Svg width={logoSize} height={logoSize} viewBox="0 0 24 24" {...icon}>
          <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <Polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <Line x1="12" y1="22.08" x2="12" y2="12" />
        </Svg>
      </View>

      <TouchableOpacity
        style={styles.themeButton}
        onPress={toggleTheme}
        accessibilityLabel={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      >
        {theme === 'dark' ? (
          <Svg width={18} height={18} viewBox="0 0 24 24" {...icon}>
            <Circle cx="12" cy="12" r="5" />
            <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </Svg>
        ) : (
          <Svg width={18} height={18} viewBox="0 0 24 24" {...icon}>
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </Svg>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.header,
      paddingHorizontal: 60,
      paddingVertical: 14,
    },
    headerCompact: {
      justifyContent: 'flex-start',
      paddingLeft: 14,
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logoCompact: {
      gap: 6,
    },
    title: {
      fontFamily: fonts.title,
      fontSize: 26,
      fontWeight: '600',
      letterSpacing: 1,
      color: c.ink,
    },
    titleCompact: {
      fontSize: 20,
      letterSpacing: 0,
    },
    themeButton: {
      position: 'absolute',
      right: 14,
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

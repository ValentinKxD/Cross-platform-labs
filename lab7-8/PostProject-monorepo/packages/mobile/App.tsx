import { useEffect, useState } from 'react';
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './src/apollo';
import AuthProvider from './src/auth/AuthProvider';
import { useAuth } from './src/auth/AuthContext';
import { ThemeProvider, useStyles, useTheme, type Palette } from './src/theme';
import Header from './src/components/Header';
import Nav, { type Page } from './src/components/Nav';
import Home from './src/components/Home';
import Calculator from './src/components/Calculator';
import Invoice from './src/components/Invoice';
import Cabinet from './src/components/Cabinet';
import LoginModal from './src/components/LoginModal';
import WebAlertHost from './src/components/WebAlertHost';

const PRIVATE_PAGES: Page[] = ['create', 'cabinet'];

function Main() {
  const styles = useStyles(createStyles);
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('home');

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === 'home') return false;
      setPage('home');
      return true;
    });
    return () => subscription.remove();
  }, [page]);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const needsLogin = PRIVATE_PAGES.includes(page) && !user && !loading;
  const visiblePage = needsLogin ? 'home' : page;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <Header />

      <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.main}>
          {visiblePage === 'home' && <Home />}
          {visiblePage === 'calculator' && <Calculator />}
          {visiblePage === 'create' && user && <Invoice onOpenCabinet={() => setPage('cabinet')} />}
          {visiblePage === 'cabinet' && user && <Cabinet onCreate={() => setPage('create')} onSignOut={() => setPage('home')} />}
        </View>
      </KeyboardAvoidingView>

      {!keyboardOpen && <Nav page={page} onNavigate={setPage} />}

      <LoginModal visible={needsLogin} onClose={() => setPage('home')} />
      <WebAlertHost />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ApolloProvider client={client}>
          <AuthProvider>
            <Main />
          </AuthProvider>
        </ApolloProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.header,
    },
    main: {
      flex: 1,
      backgroundColor: c.page,
    },
  });

import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AppThemeProvider } from './theme/ThemeProvider';
import './App.css';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { store } from './context/store';
import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppThemeProvider defaultTheme='light' storageKey='weconnect-theme'>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position='bottom-right' richColors closeButton />
          </BrowserRouter>
        </AppThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

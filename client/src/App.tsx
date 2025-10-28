import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AppThemeProvider } from './theme/ThemeProvider';
import './App.css';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  return (
    <Provider store={store}>
      <AppThemeProvider defaultTheme="light" storageKey="weconnect-theme">
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="bottom-right" richColors closeButton />
        </BrowserRouter>
      </AppThemeProvider>
    </Provider>
  );
}

export default App;

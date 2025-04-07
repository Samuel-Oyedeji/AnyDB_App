import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Or Dashboard if testing it
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Bright blue
    },
    secondary: {
      main: '#ff4081', // Vibrant pink
    },
    background: {
      default: '#f0f4f8', // Light gray-blue
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease, background-color 0.3s ease',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AppProvider>
        <CssBaseline />
        <App /> {/* Swap to <Dashboard /> to test Dashboard */}
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
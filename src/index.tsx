import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976D2', contrastText: '#FFFFFF' },
    secondary: { main: '#F5F5F5', contrastText: '#333333' },
    background: { default: '#FFFFFF', paper: '#F5F5F5' },
    text: { primary: '#333333' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { transition: 'transform 0.2s ease, background-color 0.3s ease' },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#64B5F6', contrastText: '#212121' },
    secondary: { main: '#424242', contrastText: '#E0E0E0' },
    background: { default: '#212121', paper: '#424242' },
    text: { primary: '#E0E0E0' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { transition: 'transform 0.2s ease, background-color 0.3s ease' },
      },
    },
  },
});

const AppWithTheme: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <AppProvider>
        <CssBaseline />
        <App isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </AppProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
    />
    <AppWithTheme />
  </React.StrictMode>
);
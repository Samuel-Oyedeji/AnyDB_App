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
    primary: { main: '#4B5563', contrastText: '#FFFFFF' },
    secondary: { main: '#F9FAFB', contrastText: '#1F2937' },
    background: { default: '#FFFFFF', paper: '#F9FAFB' },
    text: { primary: '#1F2937' },
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
    primary: { main: '#9CA3AF', contrastText: '#171717' },
    secondary: { main: '#1F2937', contrastText: '#D1D5DB' },
    background: { default: '#171717', paper: '#1F2937' },
    text: { primary: '#D1D5DB' },
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
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@700&display=swap"
    />
    <AppWithTheme />
  </React.StrictMode>
);
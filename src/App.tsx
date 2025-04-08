import React, { useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import ConnectPage from './components/ConnectPage';
import DataTable from './components/DataTable';

const fullDrawerWidth = 240;
const minimizedDrawerWidth = 60;

interface AppProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(${position === 1 ? '15,23,42' : '209,213,219'},${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={position === 1 ? '#0F172A' : '#D1D5DB'}
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </svg>
    </div>
  );
}

const App: React.FC<AppProps> = ({ isDarkMode, setIsDarkMode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [dbType, setDbType] = useState<string | undefined>(undefined);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const drawerWidth = isSidebarMinimized ? minimizedDrawerWidth : fullDrawerWidth;

  const handleConnectionSuccess = (tables: string[], dbType: string) => {
    setTables(tables);
    setSelectedTable(tables[0] || null);
    setDbType(dbType);
    setIsConnected(true);
  };

  const handleRefresh = () => {
    setSelectedTable(null);
    setTimeout(() => setSelectedTable(selectedTable), 0);
  };

  if (!isConnected) {
    return <ConnectPage onConnectionSuccess={handleConnectionSuccess} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
  }

  return (
    <Box className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: isDarkMode ? '#2D3748' : '#F9FAFB',
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap className={isDarkMode ? 'text-dark-text' : 'text-light-text'}>
            Database Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRadius: '0 12px 12px 0',
            backgroundColor: isDarkMode ? '#2D3748' : '#F9FAFB',
            color: isDarkMode ? '#E5E7EB' : '#111827', // Adjusted for visibility
            border: 'none',
            boxShadow: isDarkMode ? '2px 0 8px rgba(0, 0, 0, 0.3)' : '2px 0 8px rgba(0, 0, 0, 0.1)',
            transition: 'width 0.3s ease',
          },
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            sx={{ color: isDarkMode ? '#E5E7EB' : '#111827' }} // Match sidebar text
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
        <Box sx={{ overflow: 'auto', px: isSidebarMinimized ? 1 : 2, py: 2 }}>
          {!isSidebarMinimized && (
            <Typography
              variant="h6"
              sx={{
                py: 1,
                fontWeight: 'bold',
                fontFamily: "'Roboto', sans-serif",
                color: isDarkMode ? '#A3BFFA' : '#4B5563',
                borderBottom: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                mb: 2,
              }}
            >
              Tables
            </Typography>
          )}
          <List>
            {tables.map((table) => (
              <ListItemButton
                key={table}
                selected={table === selectedTable}
                onClick={() => setSelectedTable(table)}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  py: 1.5,
                  px: isSidebarMinimized ? 1 : 2,
                  backgroundColor: table === selectedTable
                    ? (isDarkMode ? '#A3BFFA' : '#4B5563')
                    : 'transparent',
                  color: table === selectedTable
                    ? (isDarkMode ? '#171717' : '#FFFFFF')
                    : (isDarkMode ? '#E5E7EB' : '#111827'), // Adjusted for visibility
                  '&:hover': {
                    backgroundColor: isDarkMode ? '#7F9CF5' : '#374151',
                    color: isDarkMode ? '#171717' : '#FFFFFF',
                    transform: isSidebarMinimized ? 'none' : 'translateX(4px)',
                    transition: 'all 0.3s ease',
                  },
                  transition: 'all 0.3s ease',
                  justifyContent: isSidebarMinimized ? 'center' : 'flex-start',
                }}
              >
                {isSidebarMinimized ? (
                  <ListItemText primary={table.charAt(0).toUpperCase()} sx={{ textAlign: 'center' }} />
                ) : (
                  <ListItemText primary={table} />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
        className="relative"
      >
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <Toolbar />
        {selectedTable && (
          <DataTable
            selectedTable={selectedTable}
            onRefresh={handleRefresh}
            dbType={dbType}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        )}
      </Box>
    </Box>
  );
};

export default App;
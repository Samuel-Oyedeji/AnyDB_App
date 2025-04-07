import React, { useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import ConnectionForm from './components/ConnectionForm';
import DataTable from './components/DataTable';

const drawerWidth = 240;

const App: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [dbType, setDbType] = useState<string | undefined>(undefined);

  const handleConnectionSuccess = (tables: string[], dbType: string) => {
    setTables(tables);
    setSelectedTable(tables[0] || null);
    setDbType(dbType);
  };

  const handleRefresh = () => {
    setSelectedTable(null);
    setTimeout(() => setSelectedTable(selectedTable), 0);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Database Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <ConnectionForm onConnectionSuccess={handleConnectionSuccess} />
          <List>
            {tables.map((table) => (
              <ListItemButton
                key={table}
                selected={table === selectedTable}
                onClick={() => setSelectedTable(table)}
              >
                <ListItemText primary={table} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {selectedTable && <DataTable selectedTable={selectedTable} onRefresh={handleRefresh} dbType={dbType} />}
      </Box>
    </Box>
  );
};

export default App;
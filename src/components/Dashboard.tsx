import React, { useState, useContext } from 'react';
import { Typography, Box } from '@mui/material';
import { AppContext } from '../context/AppContext';
import ConnectionForm from './ConnectionForm';
import TableSelector from './TableSelector';
import DataTable from './DataTable';

const Dashboard: React.FC = () => {
  const { setConnection } = useContext(AppContext)!; // Non-null assertion since AppProvider wraps it
  const [connected, setConnected] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [dbType, setDbType] = useState<string | undefined>(undefined);

  const handleConnectionSuccess = (tables: string[], dbType: string) => {
    setConnected(true);
    setTables(tables);
    setDbType(dbType);
    setConnection(dbType);
  };

  const handleTableSelect = (table: string) => {
    setSelectedTable(table);
  };

  const handleRefresh = () => {
    if (selectedTable) {
      // Could trigger a refetch if needed
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <Typography variant="h4" color="#1976d2" gutterBottom>
        Database Viewer
      </Typography>
      {!connected ? (
        <ConnectionForm onConnectionSuccess={handleConnectionSuccess} />
      ) : (
        <>
          <TableSelector tables={tables} selectedTable={selectedTable} onTableSelect={handleTableSelect} />
          {selectedTable && <DataTable selectedTable={selectedTable} onRefresh={handleRefresh} dbType={dbType} />}
        </>
      )}
    </Box>
  );
};

export default Dashboard;
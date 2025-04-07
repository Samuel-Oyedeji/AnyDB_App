import React from 'react';
import { Typography, List, ListItemButton, ListItemText, Box } from '@mui/material';

interface Props {
  tables: string[];
  selectedTable: string | null;
  onTableSelect: (table: string) => void;
}

const TableSelector: React.FC<Props> = ({ tables, selectedTable, onTableSelect }) => {
  return (
    <Box>
      <Typography variant="h6" color="#1976d2" gutterBottom>
        Connected! Select a Table:
      </Typography>
      <List>
        {tables.map((table) => (
          <ListItemButton
            key={table}
            onClick={() => onTableSelect(table)}
            selected={selectedTable === table}
          >
            <ListItemText primary={table} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default TableSelector;
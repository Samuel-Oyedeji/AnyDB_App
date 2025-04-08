import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridSortModel, GridCellEditStopParams } from '@mui/x-data-grid';
import { motion } from 'framer-motion';

interface Row {
  id: number | string;
  [key: string]: any;
}

interface Props {
  selectedTable: string;
  onRefresh: () => void;
  dbType?: string;
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

const DataTable: React.FC<Props> = ({ selectedTable, onRefresh, dbType, isDarkMode, setIsDarkMode }) => {
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRowData, setNewRowData] = useState<Row>({} as Row);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [schemaColumns, setSchemaColumns] = useState<string[]>([]);
  const [jsonView, setJsonView] = useState(false);

  const fetchSchemaColumns = async () => {
    try {
      const response = await fetch(`http://localhost:5000/columns/${selectedTable}`);
      const data = await response.json();
      if (data.columns && data.columns.length > 0) {
        setSchemaColumns(data.columns);
      } else {
        console.warn(`No columns returned for ${selectedTable}, relying on data fetch`);
        setSchemaColumns([]);
      }
    } catch (error: any) {
      console.error('Schema fetch failed:', error.message);
      setSchemaColumns([]);
    }
  };

  const fetchTableData = async () => {
    try {
      const sortField = sortModel[0]?.field;
      const sortOrder = sortModel[0]?.sort?.toUpperCase() || 'ASC';
      const url = new URL(`http://localhost:5000/data/${selectedTable}`);
      url.searchParams.append('limit', pageSize.toString());
      url.searchParams.append('offset', (page * pageSize).toString());
      if (sortField) {
        url.searchParams.append('sort', sortField);
        url.searchParams.append('order', sortOrder);
      }
      if (search) url.searchParams.append('search', search);
      if (Object.keys(filters).length > 0) url.searchParams.append('filters', JSON.stringify(filters));

      const response = await fetch(url.toString());
      const data = await response.json();
      if (data.data) {
        const rowsWithId = data.data.map((row: any, index: number) => ({
          id: row.id || row._id || `${page}-${index}`,
          ...row,
        }));
        const columnKeys = schemaColumns.length > 0 ? schemaColumns : Object.keys(data.data[0] || {});
        const newColumns: GridColDef[] = columnKeys.map((key) => ({
          field: key,
          headerName: key.charAt(0).toUpperCase() + key.slice(1),
          flex: 1,
          minWidth: 100,
          editable: true,
        }));
        setColumns(newColumns);
        setRows(rowsWithId);
        setTotalRows(data.total);
      } else {
        throw new Error(data.error || 'No data returned');
      }
    } catch (error: any) {
      console.error('Data fetch failed:', error.message);
      alert(`Failed to fetch data: ${error.message}`);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      fetchSchemaColumns();
      fetchTableData();
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [page, pageSize, sortModel, search, filters]);

  const handleCellEditStop = async (params: GridCellEditStopParams) => {
    const { id, field, value } = params;
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    try {
      const updatedRow = { [field]: value };
      const response = await fetch(`http://localhost:5000/data/${selectedTable}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRow),
      });
      const data = await response.json();
      if (data.success) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
      } else {
        throw new Error('Update failed');
      }
    } catch (error: any) {
      console.error('Update failed:', error.message);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleAddRowOpen = () => {
    const initialRow = columns.reduce<Row>((acc, col) => ({
      ...acc,
      [col.field]: col.field === 'id' || col.field === '_id' ? undefined : '',
    }), {} as Row);
    setNewRowData(initialRow);
    setOpenAddDialog(true);
  };

  const handleAddRowSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/data/${selectedTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRowData),
      });
      const data = await response.json();
      if (data.success) {
        setOpenAddDialog(false);
        fetchTableData();
      } else {
        throw new Error(data.error || 'Insert failed');
      }
    } catch (error: any) {
      console.error('Insert failed:', error.message);
      alert(`Failed to insert: ${error.message}`);
    }
  };

  const handleDeleteRows = async () => {
    if (selectedRows.length === 0) return;
    try {
      const response = await fetch(`http://localhost:5000/data/${selectedTable}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows }),
      });
      const data = await response.json();
      if (data.success) {
        setRows((prev) => prev.filter((r) => !selectedRows.includes(r.id as string)));
        setTotalRows((prev) => prev - data.deletedCount);
        setSelectedRows([]);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error: any) {
      console.error('Delete failed:', error.message);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`http://localhost:5000/export/${selectedTable}?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error.message);
      alert(`Failed to export: ${error.message}`);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => {
      if (value === '') {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: value };
    });
  };

  return (
    <Box
      className={`h-[calc(100vh-64px)] w-full flex flex-col mt-2 relative ${
        isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'
      }`}
    >
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      <Box className="mb-2 px-2 flex flex-wrap gap-2">
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          sx={{
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
              '&:hover fieldset': { borderColor: isDarkMode ? '#7F9CF5' : '#374151' },
              '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#A3BFFA' : '#4B5563' },
            },
            '& .MuiInputLabel-root': { color: isDarkMode ? '#D1D5DB' : '#1F2937' },
          }}
        />
        {schemaColumns.map((col) =>
          col !== 'id' && col !== '_id' ? (
            <TextField
              key={col}
              label={`Filter ${col.charAt(0).toUpperCase() + col.slice(1)}`}
              value={filters[col] || ''}
              onChange={(e) => handleFilterChange(col, e.target.value)}
              variant="outlined"
              sx={{
                width: { xs: '100%', sm: 200 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                  '&:hover fieldset': { borderColor: isDarkMode ? '#7F9CF5' : '#374151' },
                  '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#A3BFFA' : '#4B5563' },
                },
                '& .MuiInputLabel-root': { color: isDarkMode ? '#D1D5DB' : '#1F2937' },
              }}
            />
          ) : null
        )}
      </Box>
      <Box className="px-2 flex justify-between items-center mb-2">
        <Typography variant="subtitle1" className={isDarkMode ? 'text-dark-primary' : 'text-light-primary'}>
          Data for {selectedTable}
        </Typography>
        <Box className="flex gap-1 flex-wrap items-center">
          {dbType === 'mongodb' && (
            <FormControlLabel
              control={<Switch checked={jsonView} onChange={(e) => setJsonView(e.target.checked)} />}
              label="JSON View"
              sx={{ color: isDarkMode ? '#D1D5DB' : '#1F2937' }}
            />
          )}
          <Button
            variant="outlined"
            className={`${
              isDarkMode
                ? 'bg-dark-primary text-dark-bg border-dark-primary-hover hover:bg-dark-primary-hover hover:text-dark-text'
                : 'bg-light-primary text-light-bg border-light-primary-hover hover:bg-light-primary-hover'
            } hover:-translate-y-1 transition-all`}
            onClick={handleAddRowOpen}
          >
            Add Row
          </Button>
          <Button
            variant="outlined"
            className={`${
              isDarkMode
                ? 'bg-dark-primary text-dark-bg border-dark-primary-hover hover:bg-dark-primary-hover hover:text-dark-text'
                : 'bg-light-primary text-light-bg border-light-primary-hover hover:bg-light-primary-hover'
            } hover:-translate-y-1 transition-all`}
            onClick={onRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            className={`${
              isDarkMode
                ? 'bg-red-900 text-dark-text border-red-800 hover:bg-red-800'
                : 'bg-red-500 text-light-bg border-red-400 hover:bg-red-400'
            } hover:-translate-y-1 transition-all`}
            onClick={handleDeleteRows}
            disabled={selectedRows.length === 0}
          >
            Delete Selected ({selectedRows.length})
          </Button>
          <Button
            variant="outlined"
            className={`${
              isDarkMode
                ? 'bg-dark-secondary text-dark-text border-dark-primary hover:bg-dark-primary hover:text-dark-bg'
                : 'bg-light-secondary text-light-text border-light-primary hover:bg-light-primary'
            } hover:-translate-y-1 transition-all`}
            onClick={() => handleExport('csv')}
          >
            Export to CSV
          </Button>
          <Button
            variant="outlined"
            className={`${
              isDarkMode
                ? 'bg-dark-secondary text-dark-text border-dark-primary hover:bg-dark-primary hover:text-dark-bg'
                : 'bg-light-secondary text-light-text border-light-primary hover:bg-light-primary'
            } hover:-translate-y-1 transition-all`}
            onClick={() => handleExport('json')}
          >
            Export to JSON
          </Button>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-300 ${
                isDarkMode ? 'bg-dark-primary' : 'bg-light-primary'
              }`}
            >
              <div
                className={`w-5 h-5 bg-light-bg rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </label>
        </Box>
      </Box>
      {dbType === 'mongodb' && jsonView ? (
        <Box
          className={`flex-grow overflow-auto p-2 ${isDarkMode ? 'bg-dark-secondary text-dark-text' : 'bg-light-secondary text-light-text'}`}
        >
          <pre>{JSON.stringify(rows, null, 2)}</pre>
        </Box>
      ) : (
        <Box className="flex-grow w-full">
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={totalRows}
            paginationMode="server"
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            processRowUpdate={(newRow) => {
              handleCellEditStop({
                id: newRow.id,
                field: Object.keys(newRow)[1],
                value: Object.values(newRow)[1],
              } as GridCellEditStopParams);
              return newRow;
            }}
            onCellEditStop={handleCellEditStop}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection as string[])}
            rowSelectionModel={selectedRows}
            sx={{
              height: '100%',
              backgroundColor: isDarkMode ? '#2D3748' : '#F9FAFB',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                color: isDarkMode ? '#D1D5DB' : '#1F2937',
              },
              '& .MuiDataGrid-cell': {
                color: isDarkMode ? '#D1D5DB' : '#1F2937',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                color: isDarkMode ? '#E5E7EB' : '#1F2937',
              },
              '& .MuiCheckbox-root': {
                color: isDarkMode ? '#A3BFFA' : '#4B5563',
              },
            }}
          />
        </Box>
      )}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle sx={{ bgcolor: isDarkMode ? '#2D3748' : '#F9FAFB', color: isDarkMode ? '#D1D5DB' : '#1F2937' }}>
          Add New Row to {selectedTable}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: isDarkMode ? '#2D3748' : '#F9FAFB' }}>
          {columns.map((col) =>
            col.field !== 'id' && col.field !== '_id' ? (
              <TextField
                key={col.field}
                label={col.headerName}
                value={newRowData[col.field] || ''}
                onChange={(e) =>
                  setNewRowData((prev) => ({ ...prev, [col.field]: e.target.value }))
                }
                fullWidth
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    '&:hover fieldset': { borderColor: isDarkMode ? '#7F9CF5' : '#374151' },
                    '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#A3BFFA' : '#4B5563' },
                  },
                  '& .MuiInputLabel-root': { color: isDarkMode ? '#D1D5DB' : '#1F2937' },
                }}
              />
            ) : null
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: isDarkMode ? '#2D3748' : '#F9FAFB' }}>
          <Button
            onClick={() => setOpenAddDialog(false)}
            className={isDarkMode ? 'text-dark-text' : 'text-light-text'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddRowSubmit}
            className={`${
              isDarkMode
                ? 'bg-dark-primary text-dark-bg hover:bg-dark-primary-hover hover:text-dark-text'
                : 'bg-light-primary text-light-bg hover:bg-light-primary-hover'
            } hover:-translate-y-1 transition-all`}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTable;
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

interface Row {
  id: number | string;
  [key: string]: any;
}

interface Props {
  selectedTable: string;
  onRefresh: () => void;
  dbType?: string;
}

const DataTable: React.FC<Props> = ({ selectedTable, onRefresh, dbType }) => {
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
      // Don’t alert here—let fetchTableData handle display
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
      fetchTableData(); // Run immediately, don’t wait for schemaColumns
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
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          sx={{ mr: 2, width: 300 }}
        />
        {schemaColumns.map((col) => (
          col !== 'id' && col !== '_id' && (
            <TextField
              key={col}
              label={`Filter ${col.charAt(0).toUpperCase() + col.slice(1)}`}
              value={filters[col] || ''}
              onChange={(e) => handleFilterChange(col, e.target.value)}
              variant="outlined"
              sx={{ mr: 2, width: 200 }}
            />
          )
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" color="#1976d2">
          Data for {selectedTable}
        </Typography>
        <Box>
          {dbType === 'mongodb' && (
            <FormControlLabel
              control={<Switch checked={jsonView} onChange={(e) => setJsonView(e.target.checked)} />}
              label="JSON View"
              sx={{ mr: 2 }}
            />
          )}
          <Button variant="outlined" color="primary" onClick={handleAddRowOpen} sx={{ mr: 1 }}>
            Add Row
          </Button>
          <Button variant="outlined" color="primary" onClick={onRefresh} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="outlined" color="error" onClick={handleDeleteRows} disabled={selectedRows.length === 0} sx={{ mr: 1 }}>
            Delete Selected ({selectedRows.length})
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => handleExport('csv')} sx={{ mr: 1 }}>
            Export to CSV
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => handleExport('json')}>
            Export to JSON
          </Button>
        </Box>
      </Box>
      {dbType === 'mongodb' && jsonView ? (
        <Box sx={{ height: 400, width: '100%', overflow: 'auto', bgcolor: '#f5f5f5', p: 2 }}>
          <pre>{JSON.stringify(rows, null, 2)}</pre>
        </Box>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={totalRows}
            paginationMode="server"
            pageSizeOptions={[5, 10, 20]}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            processRowUpdate={(newRow) => {
              handleCellEditStop({ id: newRow.id, field: Object.keys(newRow)[1], value: Object.values(newRow)[1] } as GridCellEditStopParams);
              return newRow;
            }}
            onCellEditStop={handleCellEditStop}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection as string[])}
            rowSelectionModel={selectedRows}
          />
        </Box>
      )}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Row to {selectedTable}</DialogTitle>
        <DialogContent>
          {columns.map((col) => (
            (col.field !== 'id' && col.field !== '_id') && (
              <TextField
                key={col.field}
                label={col.headerName}
                value={newRowData[col.field] || ''}
                onChange={(e) => setNewRowData((prev) => ({ ...prev, [col.field]: e.target.value }))}
                fullWidth
                margin="normal"
              />
            )
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddRowSubmit} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTable;
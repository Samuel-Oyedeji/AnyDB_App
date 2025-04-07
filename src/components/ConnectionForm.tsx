import React, { useState, ChangeEvent } from 'react';
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

interface ConnectionFormProps {
  onConnectionSuccess: (tables: string[], dbType: string) => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnectionSuccess }) => {
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: '',
    username: '',
    password: '',
    database: '',
    dbType: 'mysql',
  });

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('http://localhost:5000/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status === 'connected') {
        onConnectionSuccess(data.tables, formData.dbType);
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error: any) {
      console.error('Connection failed:', error.message);
      alert(`Connection failed: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Database Type</InputLabel>
        <Select
          name="dbType"
          value={formData.dbType}
          onChange={handleSelectChange}
          label="Database Type"
        >
          <MenuItem value="mysql">MySQL</MenuItem>
          <MenuItem value="postgres">PostgreSQL</MenuItem>
          <MenuItem value="mongodb">MongoDB</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Host"
        name="host"
        value={formData.host}
        onChange={handleTextChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Port"
        name="port"
        value={formData.port}
        onChange={handleTextChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleTextChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleTextChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Database"
        name="database"
        value={formData.database}
        onChange={handleTextChange}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleConnect} sx={{ mt: 2 }}>
        Connect
      </Button>
    </Box>
  );
};

export default ConnectionForm;
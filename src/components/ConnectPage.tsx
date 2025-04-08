import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const databases = ['MySQL', 'PostgreSQL', 'Mongo'];

interface ConnectionFormProps {
  onConnectionSuccess: (tables: string[], dbType: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const ConnectPage: React.FC<ConnectionFormProps> = ({ onConnectionSuccess, isDarkMode, setIsDarkMode }) => {
  const [currentDbIndex, setCurrentDbIndex] = useState(0);
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: '',
    username: '',
    password: '',
    database: '',
    dbType: 'mysql',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDbIndex((prev) => (prev + 1) % databases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-5 md:p-10 relative overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'
      }`}
    >
      {/* Switch Toggle */}
      <div className="absolute top-5 right-5 z-20">
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
      </div>

      {/* Background Video Placeholder */}
      <video
        className="video-bg"
        autoPlay
        loop
        muted
        src="/db-animation.mp4" // Replace with your video path
      >
        Your browser does not support the video tag.
      </video>

      {/* Page Title */}
      <motion.h1
        className={`text-3xl md:text-4xl font-bold mb-10 text-center z-10 ${
          isDarkMode ? 'text-dark-primary' : 'text-light-primary'
        }`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Seamless connection to your{' '}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentDbIndex}
            className={`font-bold ${isDarkMode ? 'text-dark-primary-hover' : 'text-light-primary-hover'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {databases[currentDbIndex]}
          </motion.span>
        </AnimatePresence>
        <br />
        Database
      </motion.h1>

      {/* Form Container */}
      <div
        className={`w-[550px] p-8 rounded-2xl shadow-lg border z-10 ${
          isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-light-secondary border-light-border'
        }`}
      >
        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleConnect(); }}>
          <label className="mt-3 font-semibold">Database Type</label>
          <select
            name="dbType"
            value={formData.dbType}
            onChange={handleSelectChange}
            className={`mt-1 p-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
              isDarkMode
                ? 'bg-dark-border border-dark-primary text-dark-text focus:border-dark-primary-hover'
                : 'bg-light-border border-light-primary text-light-text focus:border-light-primary-hover'
            }`}
          >
            <option value="mysql">MySQL</option>
            <option value="postgres">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>

          <label className="mt-3 font-semibold">Host</label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleTextChange}
            placeholder="localhost"
            className={`mt-1 p-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
              isDarkMode
                ? 'bg-dark-border border-dark-primary text-dark-text focus:border-dark-primary-hover'
                : 'bg-light-border border-light-primary text-light-text focus:border-light-primary-hover'
            }`}
            required
          />

          <label className="mt-3 font-semibold">Port</label>
          <input
            type="text"
            name="port"
            value={formData.port}
            onChange={handleTextChange}
            placeholder="3306"
            className={`mt-1 p-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
              isDarkMode
                ? 'bg-dark-border border-dark-primary text-dark-text focus:border-dark-primary-hover'
                : 'bg-light-border border-light-primary text-light-text focus:border-light-primary-hover'
            }`}
            required
          />

          <label className="mt-3 font-semibold">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleTextChange}
            placeholder="root"
            className={`mt-1 p-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
              isDarkMode
                ? 'bg-dark-border border-dark-primary text-dark-text focus:border-dark-primary-hover'
                : 'bg-light-border border-light-primary text-light-text focus:border-light-primary-hover'
            }`}
            required
          />

          <label className="mt-3 font-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleTextChange}
            placeholder="Enter password"
            className={`mt-1 p-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
              isDarkMode
                ? 'bg-dark-border border-dark-primary text-dark-text focus:border-dark-primary-hover'
                : 'bg-light-border border-light-primary text-light-text focus:border-light-primary-hover'
            }`}
            required
          />

          <label className="mt-3 font-semibold">Database</label>
          <input
            type="text"
            name="database"
            value={formData.database}
            onChange={handleTextChange}
            placeholder="Database name"
            className={`mt-1 p-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
              isDarkMode
                ? 'bg-dark-border border-dark-primary text-dark-text focus:border-dark-primary-hover'
                : 'bg-light-border border-light-primary text-light-text focus:border-light-primary-hover'
            }`}
            required
          />

          <button
            type="submit"
            className={`mt-6 p-3 rounded-xl font-bold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-dark-primary text-dark-text hover:bg-dark-primary-hover'
                : 'bg-light-primary text-light-bg hover:bg-light-primary-hover'
            }`}
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConnectPage;
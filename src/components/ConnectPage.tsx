import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const databases = ['MySQL', 'PostgreSQL', 'Mongo'];

interface ConnectionFormProps {
  onConnectionSuccess: (tables: string[], dbType: string) => void;
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

const TypingText: React.FC<{ text: string; isDarkMode: boolean }> = ({ text, isDarkMode }) => {
  const characters = text.split('');

  return (
    <motion.span
      className={`inline-block font-extrabold ${isDarkMode ? 'text-dark-primary' : 'text-light-primary'}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, width: 0 },
            visible: {
              opacity: 1,
              width: 'auto',
              transition: {
                duration: 1.5,
                ease: 'easeInOut',
              },
            },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

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
    }, 6000);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/connect`, {
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
      className={`min-h-screen flex flex-col items-center justify-center p-5 md:p-10 relative overflow-hidden ${
        isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'
      }`}
    >
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
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
      <motion.h1
        className={`text-3xl md:text-4xl font-bold mb-10 text-center z-10 ${isDarkMode ? 'text-dark-text' : 'text-light-text'}`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ fontFamily: "'Roboto', sans-serif" }}
      >
        Seamless connection to your{' '}
        <TypingText text={databases[currentDbIndex]} isDarkMode={isDarkMode} />
        <br />
        Database
      </motion.h1>
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
import React, { createContext, useState, ReactNode } from 'react';

interface AppContextType {
  connection: string | null;
  setConnection: (connection: string) => void; // Match Dashboard usage
}

export const AppContext = createContext<AppContextType>({
  connection: null,
  setConnection: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<string | null>(null);

  const setConnectionHandler = (connection: string) => {
    setConnection(connection); // Type-safe: string -> string | null
  };

  return (
    <AppContext.Provider value={{ connection, setConnection: setConnectionHandler }}>
      {children}
    </AppContext.Provider>
  );
};
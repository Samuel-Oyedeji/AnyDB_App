export interface DatabaseCredentials {
    host: string;
    port: string;
    username: string;
    password: string;
    dbType: 'mysql' | 'postgres' | 'mongodb';
  }
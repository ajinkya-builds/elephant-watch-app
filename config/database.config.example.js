export const databaseConfig = {
  host: 'your_supabase_db_host',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'your_database_password',
  ssl: true
};

// Connection string format (for tools that need it)
export const getDatabaseUrl = () => {
  const { host, port, database, user, password } = databaseConfig;
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}; 
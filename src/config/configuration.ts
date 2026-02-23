export default () => ({
  port: parseInt(process.env.PORT || '5001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'learnNest',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key',
    expiration: process.env.JWT_EXPIRATION || '1h',
  },
});


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
  mail: {
    host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.MAIL_PORT || '2525', 10),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

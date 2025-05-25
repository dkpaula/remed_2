// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'samkit012425',
  database: process.env.DB_NAME || 'remed'
};

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'remed_secret_key_for_jwt_authentication',
  expiresIn: '24h'
};

// Server configuration
const serverConfig = {
  port: process.env.PORT || 5000
};

module.exports = {
  dbConfig,
  jwtConfig,
  serverConfig
}; 
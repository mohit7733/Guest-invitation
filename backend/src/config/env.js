const dotenv = require('dotenv');

dotenv.config();

const env = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://mohitbeniwal_db_user:1NA0Ky4esfL6vShX@aimantra.6j4rzya.mongodb.net/',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret',
  QR_SECRET: process.env.QR_SECRET || 'qr-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
};

module.exports = { env };



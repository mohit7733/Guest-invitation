const mongoose = require('mongoose');
const { env } = require('./env');

const connectDb = async () => {
  try {
    await mongoose.connect(env.MONGO_URI || 'mongodb+srv://mohitbeniwal_db_user:1NA0Ky4esfL6vShX@aimantra.6j4rzya.mongodb.net/');
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
};

module.exports = { connectDb };



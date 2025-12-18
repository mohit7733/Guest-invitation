const { env } = require('./config/env');
const { connectDb } = require('./config/db');
const app = require('./app');

const start = async () => {
  await connectDb();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();



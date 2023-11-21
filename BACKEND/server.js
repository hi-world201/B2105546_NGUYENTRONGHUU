require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

const app = require('./app');

async function startServer() {
  try {
    const { PORT, URL, MONGODB_LOCAL, NODE_ENV } = process.env;

    console.log(`Environment: ${NODE_ENV}`);

    // Connect to mongodb
    await mongoose.connect(MONGODB_LOCAL);
    console.log(`Connect to ${MONGODB_LOCAL} successfully!`);

    // App listen
    app.listen(PORT, URL);

    console.log(`Server is running on port ${URL}:${PORT}`);
  } catch (err) {
    console.log('There is some internal error!');
    process.exit(1);
  }
}

startServer();

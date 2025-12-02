const mongoose = require('mongoose');

const connectDB = async () => {
  // Use a safe default DB name (no spaces)
  const defaultUri = 'mongodb://127.0.0.1:27017/cloudbase_voting';
  const mongoUri = process.env.MONGO_URI || defaultUri;

  // Basic validation: ensure DB name does not contain spaces (decoded)
  try {
    // extract database name part (path after the host and before query)
    const pathStart = mongoUri.indexOf('/', mongoUri.indexOf('//') + 2);
    if (pathStart !== -1) {
      const queryStart = mongoUri.indexOf('?', pathStart);
      const dbPart = queryStart === -1 ? mongoUri.slice(pathStart + 1) : mongoUri.slice(pathStart + 1, queryStart);
      // decode percent-encoded characters and check for spaces
      const decoded = decodeURIComponent(dbPart || '');
      if (decoded.includes(' ')) {
        console.error('\nMongoDB connection error: database names cannot contain spaces.');
        console.error('Offending database name (decoded):', decoded);
        console.error("Fix: set MONGO_URI in your .env to use a name without spaces (e.g. 'cloudbase_voting') or URL-encode spaces.");
        // Do not exit the process here; throw so callers can decide how to handle in dev.
        throw new Error('Invalid MongoDB database name (contains spaces)');
      }
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    console.error('The backend will continue to run, but database-backed routes will fail until MongoDB is available.');
    // Do not call process.exit here to avoid taking down the server during local development.
    // Rethrow so callers that wish to halt startup can do so explicitly.
    throw err;
  }
};

module.exports = connectDB;

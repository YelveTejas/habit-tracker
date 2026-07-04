import mongoose from 'mongoose';

// Cached across warm serverless invocations so we don't reconnect on every request.
let connectionPromise = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        connectionPromise = null; // allow the next request to retry instead of staying stuck
        throw err;
      });
  }

  return connectionPromise;
};

export default connectDB;

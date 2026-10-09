import mongoose from 'mongoose';
import User from '../models/User.js';
import { seedData } from '../seed.js';

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  const useMemory = process.env.USE_MEMORY_DB === 'true';

  if (useMemory) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    uri = (await MongoMemoryServer.create()).getUri('college_events');
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected (${useMemory ? 'in-memory' : uri})`);

  // The in-memory DB starts empty, so seed it automatically
  if (useMemory && !(await User.exists({}))) await seedData();
};

export default connectDB;

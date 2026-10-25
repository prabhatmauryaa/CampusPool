const mongoose = require('mongoose');

let memoryServerInstance = null;

async function connectDB() {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuspool';

  try {
    // Attempt connection with short server selection timeout so we don't hang if local mongod is absent
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Successfully connected to MongoDB at: ${primaryUri}`);
    return;
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${primaryUri}): ${err.message}`);
    console.log('[Database] Falling back to embedded MongoMemoryServer for out-of-the-box local development & testing...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = memoryServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Embedded in-memory MongoDB initialized and connected: ${memoryUri}`);
  } catch (memErr) {
    console.error('[Database] Failed to initialize fallback in-memory MongoDB:', memErr.message);
    throw memErr;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};

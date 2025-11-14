import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/mooc_scraping';

async function main() {
  try {
    console.log('Connecting to', MONGO_URL);
    await mongoose.connect(MONGO_URL, { dbName: 'mooc_scraping' });
    console.log('✅ Connected to MongoDB');

    const TestSchema = new mongoose.Schema({ name: String, createdAt: { type: Date, default: Date.now } });
    const Test = mongoose.model('Test', TestSchema, 'test_collection');

    const doc = await Test.create({ name: `test-${new Date().toISOString()}` });
    console.log('Inserted document:', doc);

    const count = await Test.countDocuments();
    console.log('Documents in test_collection:', count);

    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

main();

import mongoose from 'mongoose';
import Product from './models/product.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/mooc_scraping';

const FIELDS_DEFAULTS = {
  prix: null,
  price_raw: '',
  unite: '',
  brand: '',
  description: '',
  sku: '',
  quantity: '',
  url_cible: '',
  product_url: '',
  image_url: '',
  date_extraction: null,
  last_updated: new Date()
};

async function main(){
  await mongoose.connect(MONGO_URL);
  console.log('Connected to Mongo for migration');

  for (const [field, defaultValue] of Object.entries(FIELDS_DEFAULTS)){
    const query = { [field]: { $exists: false } };
    const update = { $set: { [field]: defaultValue } };

    const res = await Product.updateMany(query, update);
    console.log(`Field '${field}': matched=${res.matchedCount}, modified=${res.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log('Migration completed and disconnected.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

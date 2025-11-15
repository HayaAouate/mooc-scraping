import mongoose from 'mongoose';
import Product from '../models/product.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/mooc_scraping';

async function main(){
  await mongoose.connect(MONGO_URL);
  console.log('Connected to Mongo for cleaning old fields');

  const oldFields = ['nom','prix','unite','url_cible','image_url','product_url','price_raw','brand','sku','quantity'];

  const unsetObj = oldFields.reduce((acc, f) => { acc[f] = ''; return acc; }, {});

  const coll = mongoose.connection.db.collection('products');
  const res = await coll.updateMany({}, { $unset: unsetObj });
  console.log('Unset result:', { matched: res.matchedCount ?? res.matched, modified: res.modifiedCount ?? res.modified });

  await mongoose.disconnect();
  console.log('Clean completed and disconnected.');
}

main().catch(err => {
  console.error('Clean failed:', err);
  process.exit(1);
});

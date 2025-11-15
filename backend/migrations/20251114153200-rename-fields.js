import mongoose from 'mongoose';
import Product from '../models/product.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/mooc_scraping';

async function main(){
  await mongoose.connect(MONGO_URL);
  console.log('Connected to Mongo for rename migration');

  // Rename nom -> name, prix -> price, unite -> unitPrice, url_cible -> storeUrl
  const renameMap = [
    { from: 'nom', to: 'name' },
    { from: 'prix', to: 'price' },
    { from: 'unite', to: 'unitPrice' },
    { from: 'url_cible', to: 'storeUrl' },
    { from: 'image_url', to: 'imageUrl' },
    { from: 'product_url', to: 'imageUrl' }
  ];

  for (const {from, to} of renameMap){
    // Only update documents that have the old field and don't yet have the new field
    const query = { [from]: { $exists: true }, [to]: { $exists: false } };

    // MongoDB updateMany can't set from another field directly using $set: { to: '$from' }
    // We'll iterate matching documents and perform per-doc rename to preserve values.
    const docs = await Product.find(query).lean();
    console.log(`Renaming ${docs.length} documents: ${from} -> ${to}`);
    let modified = 0;
    for (const doc of docs){
      const value = doc[from];
      const unset = { [from]: '' };
      const set = { [to]: value };
      const res = await Product.updateOne({ _id: doc._id }, { $set: set, $unset: unset });
      if (res.modifiedCount && res.modifiedCount > 0) modified++;
    }
    console.log(`Field rename ${from} -> ${to}: modified ${modified}/${docs.length}`);
  }

  // Ensure description exists
  const resDesc = await Product.updateMany({ description: { $exists: false } }, { $set: { description: null } });
  console.log(`description defaults: matched=${resDesc.matchedCount}, modified=${resDesc.modifiedCount}`);

  await mongoose.disconnect();
  console.log('Rename migration completed and disconnected.');
}

main().catch(err => {
  console.error('Rename migration failed:', err);
  process.exit(1);
});

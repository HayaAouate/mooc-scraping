import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Product from '../models/product.js';

// This migration imports backend/hypercacher_products_with_price.json and upserts into products collection.
// Run locally with Node after installing deps:
// MONGO_URL=mongodb://localhost:27017/mooc_scraping node backend/migrations/20251116-import-hypercacher-json.js

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/mooc_scraping';

async function main(){
  await mongoose.connect(MONGO_URL);
  console.log('Connected to Mongo for JSON import (', MONGO_URL, ')');

  const filePath = path.resolve(process.cwd(), 'backend', 'hypercacher_products_with_price.json');
  let raw;
  try{
    raw = await fs.readFile(filePath, 'utf8');
  }catch(err){
    console.error('Cannot read JSON file at', filePath, err.message);
    process.exit(1);
  }

  const data = JSON.parse(raw);
  const store = data.store || 'Hypercacher';
  const url_cible = data.url_cible || '';
  const date_extraction = data.date_extraction ? new Date(data.date_extraction) : new Date();
  const produits = data.produits || [];

  if (!produits.length){
    console.log('No products to import');
    await mongoose.disconnect();
    return;
  }

  const ops = produits.map(p => {
    const name = p.nom || p.name || '';
    const price = (typeof p.prix === 'number') ? p.prix : (typeof p.price === 'number' ? p.price : null);
    const unitPrice = p.unite || p.unitPrice || '';
    const description = (p.description === undefined) ? null : p.description;
    const imageUrl = p.image || p.image_url || p.imageUrl || null;

    return {
      updateOne: {
        filter: { store, name },
        update: {
          $set: {
            store,
            name,
            description,
            price,
            unitPrice,
            imageUrl,
            storeUrl: url_cible || '',
            date_extraction,
            last_updated: new Date()
          }
        },
        upsert: true
      }
    };
  });

  try{
    const res = await Product.bulkWrite(ops, { ordered: false });
    console.log('BulkWrite result:', {
      insertedCount: res.insertedCount || 0,
      matchedCount: res.matchedCount || res.nMatched || 0,
      modifiedCount: res.modifiedCount || res.nModified || 0,
      upsertedCount: res.upsertedCount || 0
    });
  }catch(err){
    console.error('bulkWrite failed:', err);
  }

  await mongoose.disconnect();
  console.log('Import finished');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});

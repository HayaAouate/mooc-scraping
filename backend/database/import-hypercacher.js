import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Product from '../models/product.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/mooc_scraping';

async function main(){
  try{
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

    const filePath = path.resolve('hypercacher_products_with_price.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    const store = data.store || 'Hypercacher';
    const url_cible = data.url_cible || null;
    const date_extraction = data.date_extraction ? new Date(data.date_extraction) : new Date();
    const produits = data.produits || [];

    if(!produits.length){
      console.log('No products found in JSON. Nothing to import.');
      await mongoose.disconnect();
      return;
    }

    // Map incoming product fields to the new schema names and provide defaults
    const ops = produits.map(p => {
      const name = p.nom || p.name || '';
      const price = (typeof p.prix === 'number' && !Number.isNaN(p.prix)) ? p.prix : (typeof p.price === 'number' ? p.price : null);
      const unitPrice = p.unite || p.unitPrice || '';
      const description = (p.description === undefined) ? null : p.description;
      const imageUrl = p.image || p.image_url || p.imageUrl || null;

      return {
        updateOne: {
          filter: { store, name },
          update: {
            $set: {
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

    const result = await Product.bulkWrite(ops);

    console.log('Import completed.');
    console.log('Counts:', {
      insertedCount: result.insertedCount || 0,
      matchedCount: result.matchedCount || result.nMatched || 0,
      modifiedCount: result.modifiedCount || result.nModified || 0,
      upsertedCount: result.upsertedCount || 0
    });

    await mongoose.disconnect();
  }catch(err){
    console.error('Import error:', err);
    process.exit(1);
  }
}

main();

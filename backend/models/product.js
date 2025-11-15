import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ProductSchema = new Schema({
  store: { type: String, required: true, index: true },
  // user requested field names
  name: { type: String, required: true, index: true },
  description: { type: String, default: null },

  // pricing
  price: { type: Number, default: null },
  unitPrice: { type: String, default: '' },

  // images and links
  imageUrl: { type: String, default: null },
  storeUrl: { type: String, default: '' },

  // metadata
  date_extraction: { type: Date, default: null },
  last_updated: { type: Date, default: Date.now }
}, { timestamps: false });

// We'll upsert documents by {store, nom} when importing.
const Product = mongoose.models.Product || model('Product', ProductSchema);

export default Product;

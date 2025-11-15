import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import fs from "fs";
import path from "path";
import { getLeclercProducts } from "./leclerc.js";
import mongoose from 'mongoose';
import Product from './models/product.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/mooc_scraping';

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
  try {
    const url = "https://www.auchan.fr/oeufs-produits-laitiers/cremerie-oeufs-laits/oeufs/ca-n010103";
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        Referer: "https://www.auchan.fr/",
      },
      timeout: 15000,
    });

    const data = response.data;
    console.log(`HTTP ${response.status} - received ${Buffer.byteLength(data || "", "utf8")} bytes from ${url}`);

    const $ = cheerio.load(data || "");
    const products = [];

    
    $(".product-thumbnail").each((_, el) => {
    
      const brand = $(el).find(".product-thumbnail__description strong[itemprop='brand']").text().trim();
      const title = $(el)
        .find(".product-thumbnail__description")
        .clone() 
        .children("strong")
        .remove()
        .end()
        .text()
        .trim();

      const price = $(el).find(".product-price.bolder.text-dark-color").text().trim();
      
    
      if (brand || title || price) {
        products.push({ brand, title, price });
      }
    });

    // si aucun produit trouvé, sauvegarder le HTML reçu pour inspection
    if (products.length === 0) {
      try {
        const outPath = path.resolve(new URL("./last_scrape.html", import.meta.url).pathname);
        fs.writeFileSync(outPath, data || "", "utf8");
        console.warn(`⚠️ Aucun produit trouvé — HTML sauvegardé dans ${outPath}`);
      } catch (e) {
        console.error("Impossible d'écrire last_scrape.html :", e.message);
      }
    }

    res.json({
      message: `✅ Scraping réussi (${products.length} produits trouvés)`,
      products,
    });
  } catch (err) {
    console.error("❌ Erreur scraping :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route pour exposer les produits Leclerc via le backend (exécute le scraper côté serveur)
app.get('/api/leclerc', async (req, res) => {
  try {
    const produits = await getLeclercProducts();
    res.json({ produits });
  } catch (err) {
    console.error('Erreur getLeclercProducts:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET products from MongoDB (list all imported products)
app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URL, { });
    }

    const products = await Product.find({}).sort({ name: 1 }).lean();
    res.json({ count: products.length, products });
  } catch (err) {
    console.error('Erreur /api/products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🚀 API running on http://localhost:3000/scrape"));

import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import fs from "fs";
import path from "path";

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

app.listen(3000, () => console.log("🚀 API running on http://localhost:3000/scrape"));

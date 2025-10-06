import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
  try {
    const url = "https://www.auchan.fr/oeufs-produits-laitiers/cremerie-oeufs-laits/oeufs/ca-n010103";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
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

import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/scrape", async (req, res) => {
  try {
    const { data } = await axios.get("https://www.auchan.fr/oeufs-produits-laitiers/cremerie-oeufs-laits/oeufs/ca-n010103");
    const $ = cheerio.load(data);

    const titles = [];
    $("h2").each((_, el) => {
      titles.push($(el).text());
    });

    res.json({ message : "Scrapping ok ! ",titles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🚀 API ready at http://localhost:3000"));

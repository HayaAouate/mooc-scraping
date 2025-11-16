import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer'; 

const HYPERCACHER_URL = 'https://www.hypercacher.com/search/fromage';

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100; // La distance de défilement par pas (en pixels)
            const scrollDelay = 100; // Délai entre chaque défilement (pour simuler l'humain)
            
            // Cette fonction s'appelle en boucle
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance); // Défilement vers le bas
                totalHeight += distance;

                // Condition d'arrêt : on a atteint le bas de la page, ou on a suffisamment scrollé
                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, scrollDelay);
        });
    });
}

export async function getHypercacherProducts() {
    const products = [];
    let browser;
    
    console.log('[DEBUG] Démarrage de Puppeteer pour rendre le JavaScript...');

    try {
        browser = await puppeteer.launch({ headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled' 
            ]
        });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36');
        
    
        await page.goto(HYPERCACHER_URL, { waitUntil: 'domcontentloaded', timeout: 40000 });
        
        
        const PRODUCT_CONTAINER_SELECTOR = '.item.product'; 
        
        try {
            await page.waitForSelector(PRODUCT_CONTAINER_SELECTOR, { timeout: 15000 });
            console.log('Debug 1er bloc de produits chargements');
            console.log(" Démarrage du défilement à l'infini");
            await autoScroll(page);
            console.log(" Fin du défilement à l'infini");
            
            
        } catch (e) {
            console.error(`❌ Timeout: Les produits n'ont pas chargé après 10s. Le site est bloqué ou le sélecteur est faux.`);
            return [];
        }
        
        const html = await page.content();
        await browser.close(); 
        
        const $ = load(html);
        let productsExtracted = 0;

        $(PRODUCT_CONTAINER_SELECTOR).each((i, el) => {
            const $product = $(el);

            const nom = $product.find('div.name').first().text().replace(/\s+/g, ' ').trim();
            
            let priceText = $product.find('.product-price .price').first().text().trim(); 

            priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/[^\d.]/g, ''); 
            
            const prix = parseFloat(priceText);

            const image_div = $product.find('.image').first(); 
            
    
            const styleAttr = image_div.attr('style') || '';
            let imageUrl = '';
            
            const match = styleAttr.match(/url\(['"]?(.*?)['"]?\)/); 

            if (match && match[1]) {
                imageUrl = match[1].trim(); 
            }
            const image_url = imageUrl;
    

            
            if (nom && !isNaN(prix) && prix > 0) {
                products.push({ 
                    nom, 
                    prix: parseFloat(prix.toFixed(2)),
                    unite: 'EUR' ,
                    image_url: image_url 
                });
                productsExtracted++;
            }
        });

        console.log(`[DEBUG] Cheerio a terminé l'analyse. ${productsExtracted} produits extraits.`);

        return products;

    } catch (err) {
        console.error('❌ ERREUR FATALE (Puppeteer/Network) :', err.message || err);
        if (browser) await browser.close();
        return [];
    }
}

// Expose a helper to run the full scraping + save to JSON. We DO NOT execute it at module load
// to avoid launching Puppeteer automatically when the app starts.
export async function runScraping() {
    console.log(`\n--- Démarrage manuel du script Hypercacher ---`);

    const products = await getHypercacherProducts();

    if (products.length === 0) {
        console.error("❌ Échec de l'extraction. Aucun produit (Nom/Prix) n'a pu être sauvegardé.");
        return;
    }

    const outputFilePath = path.join(process.cwd(), 'hypercacher_products_with_price.json');
    
    const jsonOutput = {
        store: "Hypercacher (Fromages)",
        url_cible: HYPERCACHER_URL,
        date_extraction: new Date().toISOString(),
        total_produits: products.length,
        produits: products 
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
    console.log(`\n✅ SUCCÈS! Extraction terminée. ${products.length} produits sauvegardés dans ${outputFilePath}`);
}       
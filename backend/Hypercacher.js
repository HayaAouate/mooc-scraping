import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer'; 

const HYPERCACHER_URL = 'https://www.hypercacher.com/search/fromage';

/**
 * Récupère les produits (Nom et Prix) en utilisant Puppeteer pour rendre la page JS.
 * @returns {Promise<Array<{nom: string, prix: number, unite: string}>>}
 */
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
            console.log(`[DEBUG] Contenu chargé. Le sélecteur ${PRODUCT_CONTAINER_SELECTOR} a été trouvé.`);
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
            
            if (nom && !isNaN(prix) && prix > 0) {
                products.push({ 
                    nom, 
                    prix: parseFloat(prix.toFixed(2)),
                    unite: 'EUR' 
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

async function runScraping() {
    console.log(`\n--- Démarrage du script Hypercacher ---`);
    
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

runScraping();
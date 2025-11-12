import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer'; // <-- L'outil NÉCESSAIRE

const LECLERC_URL = 'https://www.e.leclerc/cat/epicerie-sucree-marque-repere';

/**
 * Récupère les produits (Nom et Prix) en utilisant Puppeteer pour rendre la page JS.
 * @returns {Promise<Array<{nom: string, prix: number, unite: string}>>}
 */
export async function getLeclercProducts() {
    const products = [];
    let browser;
    
    console.log('[DEBUG] Démarrage de Puppeteer pour rendre le JavaScript...');

    try {
        // 1. Lancement du navigateur sans tête
        browser = await puppeteer.launch({ headless: true }); 
        const page = await browser.newPage();
        
        // 2. Configuration pour simuler un humain
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36');
        
        // 3. Navigation et attente (jusqu'à 30s)
        await page.goto(LECLERC_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // SÉLECTEUR CRITIQUE : on attend que le conteneur du produit apparaisse
        const PRODUCT_CONTAINER_SELECTOR = 'li.content-serverapp-c191'; 
        
        try {
            // On attend 10 secondes que les produits soient chargés
            await page.waitForSelector(PRODUCT_CONTAINER_SELECTOR, { timeout: 10000 });
            console.log(`[DEBUG] Contenu chargé. Le sélecteur ${PRODUCT_CONTAINER_SELECTOR} a été trouvé.`);
        } catch (e) {
            console.error(`❌ Timeout: Les produits n'ont pas chargé. Le site vous a peut-être bloqué l'accès JavaScript.`);
            return [];
        }
        
        // 4. Récupération du HTML FINAL (avec les produits inclus)
        const html = await page.content();
        await browser.close(); 
        
        // 5. Extraction avec Cheerio
        const $ = load(html);
        let productsExtracted = 0;

        $(PRODUCT_CONTAINER_SELECTOR).each((i, el) => {
            const $product = $(el);

            // a) Extraction du Nom (basé sur vos captures)
            const nom = $product.find('.product-label a, .product-label').first().text().replace(/\s+/g, ' ').trim();
            
            // b) Extraction du Prix (basé sur vos captures)
            let priceText = $product.find('div.price-d-flex').first().text().trim(); 

            // Nettoyage et conversion
            priceText = priceText.replace(/€/g, '.').replace(',', '.').replace(/[^\d.]/g, ''); 
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

// --- Bloc d'exécution et de sauvegarde ---
async function runScraping() {
    console.log(`\n--- Démarrage du script E.Leclerc ---`);
    
    const products = await getLeclercProducts();

    if (products.length === 0) {
        console.error("❌ Échec de l'extraction. Aucun produit (Nom/Prix) n'a pu être sauvegardé.");
        return;
    }

    const outputFilePath = path.join(process.cwd(), 'leclerc_products_with_price.json');
    
    const jsonOutput = {
        store: "E.Leclerc Marque Repère (Épicerie Sucrée)",
        url_cible: LECLERC_URL,
        date_extraction: new Date().toISOString(),
        total_produits: products.length,
        produits: products 
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
    console.log(`\n✅ SUCCÈS! Extraction terminée. ${products.length} produits sauvegardés dans ${outputFilePath}`);
}

runScraping();
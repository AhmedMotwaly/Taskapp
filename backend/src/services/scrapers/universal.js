// backend/src/services/scrapers/universal.js
const fs = require('fs');
const path = require('path');

const scrapeUniversal = async (page) => {
  console.log("--> [UNIVERSAL] Starting Stealth Scraper...");

  // 1. STEALTH MODE (Essential for Adidas)
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });
  
  try {
     await page.waitForFunction(() => document.body.innerText.length > 500, { timeout: 25000 });
  } catch(e) { console.log("--> [UNIVERSAL] Load timeout"); }

  // 2. COOKIE SMASHER
  try {
      await page.evaluate(() => {
          const banners = document.querySelectorAll('button[id*="accept"], button[class*="cookie"]');
          banners.forEach(b => b.click());
      });
      await new Promise(r => setTimeout(r, 2000));
  } catch(e) {}

  // 3. READ DETECTOR
  const detectorPath = path.join(__dirname, 'variantDetector.js');
  const detectorCode = fs.readFileSync(detectorPath, 'utf8');

  // 4. INJECT AND EXTRACT
  return await page.evaluate((scriptContent) => {
    eval(scriptContent);
    const variants = detectVariants();

    let title = document.title;
    let image = null;
    let price = null;

    // JSON-LD Strategy (Best for Adidas)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(s => {
        try {
            const json = JSON.parse(s.innerText);
            const data = Array.isArray(json) ? json : [json];
            
            data.forEach(item => {
                // Priority 1: Standard Product Image
                if (item['@type'] === 'Product') {
                    if (item.name) title = item.name;
                    if (item.image) image = Array.isArray(item.image) ? item.image[0] : item.image;
                    if (item.offers) {
                        const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                        if (offer.price) price = offer.price;
                    }
                }
                
                // Priority 2: Fallback Image (If Product didn't have one)
                // Adidas often puts the image in a separate object in the same JSON
                if (!image && item.image) {
                     image = Array.isArray(item.image) ? item.image[0] : item.image;
                }
            });
        } catch(e) {}
    });

    if (!image) image = document.querySelector('meta[property="og:image"]')?.content;
    if (!price) price = document.querySelector('meta[property="product:price:amount"]')?.content;

    const inStock = !document.body.innerText.toLowerCase().includes('out of stock');

    return { 
      title, price, image, inStock,
      variants: variants || [],
      hasVariants: variants && variants.length > 0 
    };
  }, detectorCode);
};

module.exports = { scrapeUniversal };
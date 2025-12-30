// src/services/scrapers/ebay.js
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  let clean = priceStr.replace(/[^0-9.,]/g, '').trim();
  return parseFloat(clean) || 0;
};

const scrapeEbay = async (page) => {
  const data = await page.evaluate(() => {
    const getText = (s) => document.querySelector(s)?.innerText.trim();
    const getSrc = (s) => document.querySelector(s)?.src;

    const title = getText('.x-item-title__mainTitle') || getText('h1');
    
    const priceStr = 
      getText('.x-price-primary') || 
      getText('.prcIsum') || 
      getText('#prcIsum');

    const image = 
      getSrc('.x-photos-min-view__image') || 
      getSrc('#icImg');

    // --- STOCK DETECTION ---
    let inStock = false;

    // Method 1: Buttons
    const buyButton = document.querySelector('#isCartBtn_btn, #binBtn_btn, a[id*="binBtn"], a[id*="isCartBtn"]');
    const mainCta = document.querySelector('.x-buy-box-cta button, .x-buy-box-cta a');

    if ((buyButton || mainCta) && !(buyButton?.disabled || mainCta?.getAttribute('aria-disabled') === 'true')) {
      inStock = true;
    }

    // Method 2: Negative Text (Out of stock overlay)
    const statusText = document.querySelector('.d-status__label, #msgPanel, .x-msku__error')?.innerText.toLowerCase() || '';
    if (statusText.includes('out of stock') || 
        statusText.includes('ended') || 
        statusText.includes('nicht mehr vorrätig') ||
        statusText.includes('sold out')) {
      inStock = false;
    }

    // Method 3: JSON-LD (Structured Data)
    if (!inStock) {
      try {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
          const json = JSON.parse(script.innerText);
          const products = Array.isArray(json) ? json : [json];
          
          for (const p of products) {
            if (p && p['@type'] === 'Product' && p.offers) {
               const offers = Array.isArray(p.offers) ? p.offers : [p.offers];
               for (const offer of offers) {
                 if (offer.availability && 
                    (offer.availability.includes('InStock') || offer.availability.includes('LimitedAvailability'))) {
                    inStock = true;
                    console.log("[PAGE] Found InStock in JSON-LD");
                    break;
                 }
               }
            }
          }
          if (inStock) break;
        }
      } catch (e) {}
    }

    return { title, priceStr, image, inStock };
  });

  return {
    title: data.title,
    price: parsePrice(data.priceStr),
    image: data.image,
    inStock: data.inStock
  };
};

module.exports = { scrapeEbay };
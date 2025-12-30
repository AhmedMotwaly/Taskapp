const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// 1. IMPORT ALL SCRAPERS
const { scrapeMediaMarktSaturn } = require('./scrapers/mediamarktSaturn');
const { scrapeRossmann } = require('./scrapers/rossmann');
const { scrapeZalando, isZalandoUrl } = require('./scrapers/zalando');
const { scrapeAmazon, isAmazonUrl } = require('./scrapers/amazon');
const { scrapeEbay } = require('./scrapers/ebay');

puppeteer.use(StealthPlugin());

/**
 * INTELLIGENT PRICE CLEANER
 */
const parsePrice = (raw) => {
  if (!raw) return 0;
  if (typeof raw === 'number') return raw;

  let str = raw.toString().trim();

  // Handle "4\n69" format (Amazon fallback)
  if (str.includes('\n')) {
    str = str.replace(/\n/g, '.');
  }

  // Remove text (keep digits, dots, commas, dashes)
  str = str.replace(/[^0-9.,\-]/g, '');

  // Handle German style "9,70" -> "9.70"
  if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } 
  else if (str.includes(',') && str.includes('.')) {
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');
    if (lastComma > lastDot) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  }

  // Handle dashes (9,--)
  if (str.endsWith('-') || str.endsWith('–')) {
     str = str.replace(/[\-–]$/, '00'); 
  }

  return parseFloat(str) || 0;
};

// --- UNIVERSAL SCRAPER (Fallback) ---
const scrapeUniversal = async (page) => {
  console.log("--> [LOGIC] Running Universal Scraper...");
  try {
     await page.waitForFunction(() => document.body.innerText.length > 500, { timeout: 5000 });
  } catch(e) {
    console.log("--> [LOGIC] Page content may be limited");
  }

  return await page.evaluate(() => {
    let price = null;
    let title = document.title;
    let image = null;
    let inStock = true;

    // Strategy 1: JSON-LD
    try {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        const json = JSON.parse(script.innerText);
        const products = Array.isArray(json) ? json : [json];
        for (const p of products) {
          if (p['@type'] === 'Product') {
             if (p.name) title = p.name;
             if (p.image) image = Array.isArray(p.image) ? p.image[0] : p.image;
             if (p.offers) {
                const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
                if (offer.price) price = offer.price;
                if (offer.availability) {
                   inStock = offer.availability.includes('InStock');
                }
             }
          }
        }
      }
    } catch(e) {}

    // Strategy 2: Meta Tags
    if (!price) {
        const metaPrice = document.querySelector('meta[property="product:price:amount"]');
        if (metaPrice) price = metaPrice.content;
    }
    if (!title || title === document.title) {
        const metaTitle = document.querySelector('meta[property="og:title"]');
        if (metaTitle) title = metaTitle.content;
    }
    if (!image) {
        const metaImg = document.querySelector('meta[property="og:image"]');
        if (metaImg) image = metaImg.content;
    }

    // Strategy 3: Visual Search
    if (!price) {
        let maxScore = 0;
        document.querySelectorAll('*').forEach((el) => {
          if (el.children.length === 0 && el.innerText && el.innerText.length < 30) {
            const txt = el.innerText.trim();
            if (txt.match(/[0-9]/) && txt.match(/€|EUR|\$|£/)) {
               const style = window.getComputedStyle(el);
               if (style.textDecorationLine.includes('line-through')) return; 
               
               let score = parseFloat(style.fontSize) * 2;
               if (style.fontWeight > 500) score += 10;
               if (score > maxScore) {
                 maxScore = score;
                 price = txt;
               }
            }
          }
        });
    }
    
    // Simple Out of Stock Check
    const bodyText = document.body.innerText.toLowerCase();
    if (bodyText.includes('out of stock') || bodyText.includes('ausverkauft')) {
        inStock = false;
    }

    return { price, title, image, inStock };
  });
};

const fetchProductDetails = async (url, selectedVariant = null) => {
  console.log(`[SCRAPER] Processing: ${url}`);
  
  let browser = null;
  
  try {
    browser = await puppeteer.launch({ 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // 🔥 FIX #1: Don't block CSS for Amazon (they need it for decimals)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const requestUrl = req.url();
      
      // Allow stylesheets for Amazon (they hide decimals in CSS)
      if (requestUrl.includes('amazon.') && resourceType === 'stylesheet') {
        return req.continue();
      }
      
      // Block other heavy resources
      if (['font', 'media', 'stylesheet'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    console.log(`[SCRAPER] Loading page...`);
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    await new Promise(r => setTimeout(r, 2000));

    console.log(`[SCRAPER] Page loaded, detecting logic...`);

    // 🔥 FIX #2: Define result BEFORE using it
    let result = null;

    // --- ROUTING LOGIC ---
    if (isAmazonUrl && isAmazonUrl(url)) {
      console.log(`[SCRAPER] Using Amazon scraper`);
      result = await scrapeAmazon(page);
    }
    else if (isZalandoUrl(url)) {
      console.log(`[SCRAPER] Using Zalando scraper`);
      result = await scrapeZalando(page, selectedVariant);
    }
    else if (url.includes('mediamarkt') || url.includes('saturn')) {
      console.log(`[SCRAPER] Using MediaMarkt/Saturn scraper`);
      result = await scrapeMediaMarktSaturn(page);
    }
    else if (url.includes('rossmann')) {
      console.log(`[SCRAPER] Using Rossmann scraper`);
      result = await scrapeRossmann(page);
    } 
    else if (url.includes('ebay')) {
      console.log(`[SCRAPER] Using eBay scraper`);
      result = await scrapeEbay(page);
    }
    else {
      console.log(`[SCRAPER] Using Universal scraper`);
      result = await scrapeUniversal(page);
    }

    await browser.close();
    
    if (!result || (!result.price && !result.title)) {
      console.error(`[SCRAPER] No data extracted from page`);
      return null;
    }

    const finalPrice = parsePrice(result.price);
    
    // 🔥 DEBUG LOG (Remove after confirming fix)
    console.log(`[PRICE DEBUG] Raw: "${result.price}" => Parsed: ${finalPrice}`);
    
    let finalImage = result.image || "";
    if (finalImage && !finalImage.startsWith('http')) finalImage = "";

    console.log(`[SCRAPER SUCCESS] ${result.title?.substring(0, 40)}... @ €${finalPrice}`);

    return {
      title: result.title || "Unknown Product",
      price: finalPrice,
      image: finalImage,
      inStock: result.inStock !== false, 
      hasVariants: result.hasVariants || false,
      variants: result.variants || [],
      url
    };

  } catch (error) {
    console.error(`[SCRAPER ERROR] ${error.message}`);
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    return null;
  }
};

module.exports = { fetchProductDetails };
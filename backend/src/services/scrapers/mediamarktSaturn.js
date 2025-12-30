// src/services/scrapers/mediamarktSaturn.js

const scrapeMediaMarktSaturn = async (page) => {
  console.log("--> [LOGIC] Running MediaMarkt/Saturn (Discounted Price Mode)...");

  // Wait for body with error handling
  try {
    await page.waitForSelector('body', { timeout: 15000 });
  } catch (e) {
    console.log("--> [LOGIC] Timeout waiting for body, continuing anyway...");
  }

  // Wait for price elements to load
  try {
    await page.waitForFunction(
      () => {
        const priceBox = document.querySelector('[data-test="product-price"]');
        return priceBox && priceBox.innerText.length > 0;
      },
      { timeout: 10000 }
    );
  } catch (e) {
    console.log("--> [LOGIC] Waiting for price box timed out...");
  }

  return await page.evaluate(() => {
    let price = null;
    let title = document.title;
    let image = null;

    console.log("[PAGE] Starting MediaMarkt/Saturn price extraction...");

    // --- PRIORITY 1: VISUAL PRICE (ACTUAL SELLING PRICE) ---
    // This is the most reliable for discounted prices
    const priceBox = document.querySelector('[data-test="product-price"]');
    if (priceBox) {
      console.log("[PAGE] Found price box, analyzing...");
      
      let candidates = [];
      
      // Collect all potential price elements with their properties
      priceBox.querySelectorAll('*').forEach(el => {
        const txt = el.innerText?.trim() || "";
        const style = window.getComputedStyle(el);
        
        // Must contain numbers and currency symbol or be a standalone number
        if (txt.match(/\d/) && txt.length < 30) {
          const isStrikethrough = style.textDecorationLine.includes('line-through');
          const isUVP = txt.match(/uvp|unverbindlich|statt|vorher/i);
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = parseInt(style.fontWeight);
          
          // Skip strikethrough prices (original prices)
          if (isStrikethrough || isUVP) {
            console.log("[PAGE] Skipping strikethrough/UVP:", txt);
            return;
          }
          
          // Skip tiny text (likely "ab" or "inkl. MwSt")
          if (fontSize < 12) {
            return;
          }
          
          // Calculate score: bigger and bolder = more likely to be actual price
          const score = fontSize * 2 + (fontWeight > 500 ? 20 : 0);
          
          candidates.push({ txt, score, fontSize, fontWeight });
        }
      });
      
      // Sort by score (highest first)
      candidates.sort((a, b) => b.score - a.score);
      
      console.log("[PAGE] Price candidates:", candidates.slice(0, 3));
      
      if (candidates.length > 0) {
        price = candidates[0].txt;
        console.log("[PAGE] Selected visual price:", price);
      }
    }

    // --- PRIORITY 2: STRUCTURED DATA (Only if visual failed) ---
    if (!price) {
      console.log("[PAGE] Trying structured data...");
      
      // Try JSON-LD first
      try {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
          try {
            const json = JSON.parse(script.innerText);
            const products = Array.isArray(json) ? json : [json];
            
            for (const p of products) {
              if (p && p['@type'] === 'Product') {
                if (p.name && !title) title = p.name;
                if (p.image && !image) {
                  image = Array.isArray(p.image) ? p.image[0] : p.image;
                }
                
                if (p.offers) {
                  const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
                  // Look for lowPrice first (discounted), then price
                  if (offer.lowPrice) {
                    price = offer.lowPrice;
                    console.log("[PAGE] Found lowPrice in JSON-LD:", price);
                    break;
                  } else if (offer.price) {
                    // Only use regular price if it's the only option
                    const tempPrice = offer.price;
                    console.log("[PAGE] Found price in JSON-LD:", tempPrice);
                    if (!price) price = tempPrice;
                  }
                }
              }
            }
          } catch (parseError) {
            console.log("[PAGE] Error parsing JSON-LD");
          }
        }
      } catch (e) {
        console.log("[PAGE] JSON-LD Error");
      }
    }

    // --- PRIORITY 3: META TAGS (Least reliable for discounts) ---
    if (!price) {
      console.log("[PAGE] Trying meta tags...");
      const metaPrice = document.querySelector('meta[property="product:price:amount"]');
      if (metaPrice) {
        price = metaPrice.content;
        console.log("[PAGE] Found price in meta tag:", price);
      }
    }

    // Get title and image
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) title = metaTitle.content;

    const metaImage = document.querySelector('meta[property="og:image"]');
    if (metaImage) image = metaImage.content;

    // --- PRIORITY 4: AGGRESSIVE FALLBACK ---
    if (!price) {
      console.log("[PAGE] Trying aggressive search...");
      // Find all text that looks like a price
      const allElements = document.querySelectorAll('*');
      let bestCandidate = null;
      let bestScore = 0;
      
      allElements.forEach(el => {
        if (el.children.length === 0) {
          const txt = el.innerText?.trim() || "";
          const style = window.getComputedStyle(el);
          
          // Look for price pattern
          if (txt.match(/^\d{2,4}[,\.\-–—]\s*€?$/) || txt.match(/^€?\s*\d{2,4}[,\.\-–—]$/)) {
            const isStrikethrough = style.textDecorationLine.includes('line-through');
            
            if (!isStrikethrough) {
              const fontSize = parseFloat(style.fontSize);
              const fontWeight = parseInt(style.fontWeight);
              const score = fontSize * 2 + (fontWeight > 500 ? 20 : 0);
              
              if (score > bestScore) {
                bestScore = score;
                bestCandidate = txt;
              }
            }
          }
        }
      });
      
      if (bestCandidate) {
        price = bestCandidate;
        console.log("[PAGE] Found price via aggressive search:", price);
      }
    }

    console.log("[PAGE] Final results:", { 
      price, 
      title: title.substring(0, 50), 
      hasImage: !!image 
    });

    // ADD STOCK DETECTION
let inStock = false;

// Method 1: Check for "Add to Cart" button
const addToCartButton = document.querySelector(
  'button[class*="add-to-cart"], button[class*="addToCart"], [class*="buy-button"]'
);
if (addToCartButton && !addToCartButton.disabled) {
  inStock = true;
}

// Method 2: Check for "Out of Stock" text
const bodyText = document.body.innerText.toLowerCase();
if (!bodyText.includes('ausverkauft') && 
    !bodyText.includes('nicht verfügbar') && 
    !bodyText.includes('nicht lieferbar')) {
  inStock = true;
}

// Method 3: Check JSON-LD availability
if (!inStock) {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      const json = JSON.parse(script.innerText);
      const products = Array.isArray(json) ? json : [json];
      
      for (const p of products) {
        if (p && p['@type'] === 'Product' && p.offers) {
          const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
          if (offer.availability && 
              (offer.availability.includes('InStock') || 
               offer.availability.includes('LimitedAvailability'))) {
            inStock = true;
            break;
          }
        }
      }
    }
  } catch (e) {}
}

return { price, title, image, inStock };  // ADD inStock
  });
};

module.exports = { scrapeMediaMarktSaturn };
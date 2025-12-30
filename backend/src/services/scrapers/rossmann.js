// src/services/scrapers/rossmann.js

const scrapeRossmann = async (page) => {
  console.log("--> [LOGIC] Running Rossmann Specific Scraper...");

  // 1. Wait for Body
  try {
    await page.waitForSelector('body', { timeout: 15000 });
  } catch (e) {
    console.log("--> [LOGIC] Timeout waiting for body, continuing...");
  }

  return await page.evaluate(() => {
    let price = null;
    let title = document.title;
    let image = null;
    let inStock = false; // Default to false

    console.log("[PAGE] Starting Rossmann extraction...");

    // STRATEGY A: HIDDEN NEXT.JS DATA (100% Reliability)
    try {
      const nextData = document.getElementById('__NEXT_DATA__');
      if (nextData) {
        const json = JSON.parse(nextData.innerText);
        const props = json.props?.pageProps;
        const product = props?.product || props?.initialState?.products?.product;
        
        if (product) {
          // 1. Get Image
          if (product.images && Array.isArray(product.images) && product.images.length > 0) {
             const firstImage = product.images[0];
             image = (typeof firstImage === 'object' && firstImage.url) ? firstImage.url : firstImage;
          }
          
          // 2. Get Price
          if (product.price) {
             if (typeof product.price === 'object' && product.price.value) {
                price = product.price.value.toString();
             } else if (typeof product.price === 'number' || typeof product.price === 'string') {
                price = product.price.toString();
             }
          }
          
          // 3. Get Title
          if (product.name) {
             title = product.name;
          }

          // 4. Get Stock (Specific to Rossmann Data)
          // Rossmann often uses 'inventory' or 'status' in their JSON
          if (product.inventory?.stock > 0 || product.status === 'AVAILABLE' || product.available) {
             inStock = true;
             console.log("[PAGE] Found stock in NextData");
          }
        }
      }
    } catch(e) {
      console.log("[PAGE] NextData extraction failed:", e.message);
    }

    // STRATEGY B: Visual Fallback for Price
    if (!price) {
       const selectors = ['.rm-price__current', '[data-testid="price"]', '.price-current'];
       for (const selector of selectors) {
         const pEl = document.querySelector(selector);
         if (pEl && pEl.innerText) {
           price = pEl.innerText.trim();
           break;
         }
       }
    }

    // STRATEGY C: Visual Fallback for Image
    if (!image) {
       const imgEl = document.querySelector('.rm-product__image img, [data-testid="product-image"] img');
       if (imgEl) {
          if (imgEl.srcset) {
             const parts = imgEl.srcset.split(',');
             image = parts[parts.length - 1].trim().split(' ')[0];
          } else if (imgEl.src) {
             image = imgEl.src;
          }
       }
    }

    // Fallback Title
    if (title === document.title) {
       const h1 = document.querySelector('h1, [data-testid="product-title"]');
       if (h1) title = h1.innerText.trim();
    }

    // --- STOCK DETECTION (The Critical Update) ---
    
    // Method 1: Check for Buttons (Visual)
    if (!inStock) {
        const addToCartButton = document.querySelector(
          'button[data-testid="add-to-cart-button"], button.rm-button--primary, button[aria-label*="Warenkorb"]'
        );
        if (addToCartButton && !addToCartButton.disabled) {
          inStock = true;
        }
    }

    // Method 2: Check Negative Keywords (Text)
    if (!inStock) {
        const bodyText = document.body.innerText.toLowerCase();
        // If it DOESN'T say "sold out", assume it IS available
        if (!bodyText.includes('ausverkauft') && 
            !bodyText.includes('nicht verfügbar') &&
            !bodyText.includes('online nicht erhältlich')) {
          inStock = true;
        }
    }

    // Method 3: JSON-LD (Structured Data) - Added based on your file
    if (!inStock) {
      try {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
          const json = JSON.parse(script.innerText);
          const products = Array.isArray(json) ? json : [json];
          
          for (const p of products) {
            if (p && (p['@type'] === 'Product' || p['@type'] === 'ItemPage')) {
               const offers = p.offers ? (Array.isArray(p.offers) ? p.offers : [p.offers]) : [];
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
      } catch (e) { console.log("[PAGE] JSON-LD check failed"); }
    }

    return { price, title, image, inStock };
  });
};

module.exports = { scrapeRossmann };
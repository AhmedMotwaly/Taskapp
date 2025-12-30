// backend/src/services/scrapers/zalando.js
const fs = require('fs');
const path = require('path');

const scrapeZalando = async (page, selectedVariant = null) => {
  // 🚨 VERSION CHECK: You MUST see v8.1 in your logs!
  console.log("--> [ZALANDO] *** USING v8.1 FINAL GERMAN FIX ***");
  
  // 1. Setup Browser
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

  // ENABLE LOGS
  page.on('console', msg => console.log('[BROWSER LOG]:', msg.text()));

  try {
    await page.waitForSelector('body', { timeout: 15000 });

    // 🍪 KILL COOKIES
    await page.evaluate(() => {
        const banners = document.querySelectorAll('#uc-btn-accept-banner, button[data-testid="uc-accept-all-button"]');
        banners.forEach(b => b.click());
    });
    await new Promise(r => setTimeout(r, 1000));

    // 📜 SCROLL
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(r => setTimeout(r, 1000));

    // 🖱️ OPEN MENU (Aggressive Click)
    await page.evaluate(() => {
        const triggers = Array.from(document.querySelectorAll('button, div[role="button"]'));
        const sizeBtn = triggers.find(b => {
             const t = (b.innerText || "").toLowerCase();
             // Match English AND German "Choose/Select"
             return (t.includes('choose') || t.includes('size') || t.includes('größe') || t.includes('wählen'));
        });
        if (sizeBtn) {
            console.log(`Clicking size button: "${sizeBtn.innerText}"`);
            sizeBtn.click();
        } else {
            console.log("No size button found.");
        }
    });

    // ⏳ WAIT 5 SECONDS (Critical)
    await new Promise(r => setTimeout(r, 5000));

  } catch (e) { console.log("[ZALANDO] Interaction error:", e.message); }

  // 🕵️ EXTRACT SIZES
  return await page.evaluate((selectedVariant) => {
    
    const getSizes = () => {
        const sizes = [];
        const seen = new Set();

        // 1. SELECTORS (Sheets, Modals, Lists)
        const sizeElements = document.querySelectorAll(
            'div[class*="sheet"] li, ' +
            'div[class*="modal"] li, ' +
            'div[id*="popover"] li, ' +
            'ul[class*="size"] li, ' +
            'li[role="option"], ' +
            'div[class*="option"], ' +
            'button[aria-label*="size"], ' +
            'span[class*="size"], ' +
            'label[class*="size"]'
        );

        sizeElements.forEach(el => {
            let text = (el.innerText || "").trim();

            // CLEANING
            text = text.replace(/Only\s+\d+\s+left/i, '')
                       .replace(/Nur\s+\d+\s+verfügbar/i, '')
                       .replace(/\s+/g, ' ')
                       .trim();

            if (!text) return;

            // 🛑 FILTERING (The German Fix)
            const lower = text.toLowerCase();
            if (lower.includes('notify') || 
                lower.includes('benachrichtigt') || 
                lower.includes('select') || 
                lower.includes('auswählen') || 
                lower.includes('choose') || 
                lower.includes('bitte') ||   // "Please"
                lower.includes('wählen') ||  // "Choose"
                lower.includes('guide')) {
                return;
            }

            // VALIDATION
            if (!/[0-9a-z]/i.test(text)) return;
            if (text.length > 20) return;

            // AVAILABILITY
            let isUnavailable = false;
            if (el.disabled || el.getAttribute('aria-disabled') === 'true' || el.className.includes('disabled') || el.className.includes('out-of-stock')) isUnavailable = true;
            
            const li = el.closest('li');
            if (li && (li.className.includes('disabled') || li.className.includes('out-of-stock') || li.getAttribute('aria-disabled') === 'true')) isUnavailable = true;

            if (!seen.has(text)) {
                seen.add(text);
                sizes.push({ value: text, available: !isUnavailable });
            }
        });

        return sizes;
    };

    const variants = [];
    const sizes = getSizes();

    console.log('DETECTED SIZES:', JSON.stringify(sizes));
    
    if (sizes.length > 0) {
        variants.push({ name: 'Size', type: 'size', options: sizes });
    }

    // Colors
    const colors = [];
    document.querySelectorAll('a[href*="color"] img').forEach(img => {
        const name = (img.getAttribute('alt') || "").replace(/selected|unselected|:/gi, '').trim();
        if (name) colors.push({ value: name, available: true });
    });
    if (colors.length > 0) variants.push({ name: 'Color', type: 'color', options: colors });

    const getMeta = (p) => document.querySelector(`meta[property="${p}"]`)?.content;
    const title = getMeta('og:title') || document.title;
    const image = getMeta('og:image');
    const price = getMeta('product:price:amount') || document.body.innerText.match(/€\s*[\d,.]+/)?.[0];
    const inStock = !document.body.innerText.toLowerCase().includes('out of stock');

    return {
      price, title, image, inStock,
      variants,
      hasVariants: variants.length > 0,
      selectedVariant
    };
  }, selectedVariant);
};

const isZalandoUrl = (url) => url.includes('zalando');
module.exports = { scrapeZalando, isZalandoUrl };
// backend/src/services/scrapers/zalando.js
const fs = require('fs');
const path = require('path');

const scrapeZalando = async (page, selectedVariant = null) => {
  // 🚨 VERIFICATION LOG: If you don't see this in your docker logs, you are running old code!
  console.log("--> [ZALANDO] *** USING V8.0 FINAL DEBUG SCRAPER ***");
  console.log("--> [ZALANDO] Mode: Scroll + Sheet/Modal + Expanded Selectors");

  // 1. Setup Browser
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

  // 🔊 ENABLE BROWSER LOGGING (Crucial for debugging)
  page.on('console', msg => console.log('[BROWSER LOG]:', msg.text()));

  try {
    await page.waitForSelector('body', { timeout: 15000 });

    // 🍪 KILL COOKIES
    await page.evaluate(() => {
        const banners = document.querySelectorAll('#uc-btn-accept-banner, button[data-testid="uc-accept-all-button"]');
        banners.forEach(b => b.click());
    });
    await new Promise(r => setTimeout(r, 1000));

    // 📜 SCROLL (Triggers lazy loading)
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(r => setTimeout(r, 1000));

    // 🖱️ OPEN MENU
    await page.evaluate(() => {
        const triggers = Array.from(document.querySelectorAll('button, div[role="button"]'));
        const sizeBtn = triggers.find(b => {
             const t = (b.innerText || "").toLowerCase();
             // German & English keywords
             return (t.includes('choose') || t.includes('size') || t.includes('größe') || t.includes('wählen'));
        });
        if (sizeBtn) {
            console.log(`Clicking size button: "${sizeBtn.innerText}"`);
            sizeBtn.click();
        } else {
            console.log("No specific size button found (might be open or single-size)");
        }
    });

    // ⏳ WAIT 5 SECONDS (Animations)
    await new Promise(r => setTimeout(r, 5000));

  } catch (e) { console.log("[ZALANDO] Interaction error:", e.message); }

  // 🕵️ EXTRACT SIZES
  return await page.evaluate((selectedVariant) => {
    
    const getSizes = () => {
        const sizes = [];
        const seen = new Set();

        // SELECTORS: Targeting Sheets, Modals, and Standard Lists
        const sizeElements = document.querySelectorAll(
            'div[class*="sheet"] li, ' +
            'div[class*="modal"] li, ' +
            'div[id*="popover"] li, ' +
            'ul[class*="size"] li, ' +
            'li[role="option"], ' +
            'div[class*="option"], ' +
            'button[aria-label*="size"], ' +
            'button[class*="size"], ' +
            'span[class*="size"], ' +
            'label[class*="size"]'
        );

        sizeElements.forEach(el => {
            let text = (el.innerText || "").trim();

            // CLEANING
            text = text
                .replace(/Only\s+\d+\s+left/i, '')
                .replace(/Nur\s+\d+\s+verfügbar/i, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (!text) return;

            // FILTERING INSTRUCTIONS
            const lower = text.toLowerCase();
            if (lower.includes('notify') || lower.includes('select') || lower.includes('choose') || lower.includes('guide')) {
                return;
            }

            // VALIDATION: Relaxed regex to allow "70B", "SxS", "36 | S"
            // Must have at least one digit OR letter
            if (!/[0-9a-z]/i.test(text)) return;
            // Must be short
            if (text.length > 20) return;

            // AVAILABILITY
            let isUnavailable = false;
            if (el.disabled || el.getAttribute('aria-disabled') === 'true' || el.className.includes('disabled') || el.className.includes('out-of-stock')) {
                isUnavailable = true;
            }
            // Check parent LI
            const li = el.closest('li');
            if (li && (li.className.includes('disabled') || li.className.includes('out-of-stock') || li.getAttribute('aria-disabled') === 'true')) {
                isUnavailable = true;
            }

            if (!seen.has(text)) {
                seen.add(text);
                sizes.push({ value: text, available: !isUnavailable });
            }
        });

        // Fallback: Read button text if list extraction failed
        if (sizes.length === 0) {
             const btn = document.querySelector('button[aria-label*="size"]');
             if (btn) {
                 const t = btn.innerText.trim();
                 if (t && !t.toLowerCase().includes('choose')) {
                     sizes.push({ value: t, available: true });
                 }
             }
        }

        return sizes;
    };

    const variants = [];
    const sizes = getSizes();

    // 🚨 BROWSER DEBUG LOG
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

    // Metadata
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
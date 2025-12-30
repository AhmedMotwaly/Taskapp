const scrapeAmazon = async (page) => {
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.waitForSelector('#productTitle', { timeout: 15000 });
  } catch (e) {
    console.log("[AMAZON] Timeout waiting for product title");
  }

  // Scroll to load lazy content
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 3000));

  // Try to expand size selector
  try {
    await page.click('#inline-twister-expander-header-size_name');
    await new Promise(r => setTimeout(r, 1000));
  } catch (e) {}

  const data = await page.evaluate(() => {
    const getText = (s) => document.querySelector(s)?.innerText?.trim();
    const getSrc = (s) => document.querySelector(s)?.src;
    const variants = [];

    // ============ HELPER: Check if value looks like a valid size ============
    const isValidSize = (val) => {
      if (!val) return false;
      if (val.length > 20) return false;
      
      // Must NOT contain these:
      if (/[€$£]/.test(val)) return false;
      if (/^\d+[.,]\d{2}$/.test(val)) return false;
      if (/[←→]/.test(val)) return false;
      if (/^Previous/i.test(val)) return false;
      if (/^Next/i.test(val)) return false;
      if (/^\d+$/.test(val) && val.length === 1) return false; // Single digit = pagination
      if (/^See /i.test(val)) return false;
      if (/^Cancel/i.test(val)) return false;
      if (/^Confirm/i.test(val)) return false;
      if (/^Select/i.test(val)) return false;
      if (/^View/i.test(val)) return false;
      if (/^360/.test(val)) return false;
      if (/available/i.test(val)) return false;
      
      // Valid size patterns:
      if (/^X{0,3}S$/i.test(val)) return true;
      if (/^X{0,4}L$/i.test(val)) return true;
      if (/^M$/i.test(val)) return true;
      if (/^\d+\s*X*L/i.test(val)) return true;
      if (/^X+L\s+large/i.test(val)) return true;
      if (/^\d+\s*X*L\s+large/i.test(val)) return true;
      if (/^\d{2}$/.test(val)) return true; // Two digit numeric sizes like 38, 40
      if (/^\d{1,2}[-\/]\d{1,2}$/.test(val)) return true;
      if (/^(Small|Medium|Large|Extra)/i.test(val)) return true;
      if (/^One\s*Size/i.test(val)) return true;
      if (/^(EU|US|UK)\s*\d/i.test(val)) return true;
      if (val.length <= 4 && /[SMLX]/i.test(val)) return true;
      
      return false;
    };

    // ============ SIZE EXTRACTION ============
    const sizeOptions = [];
    const seenSizes = new Set();

    const twister = document.querySelector('#twister_feature_div');
    if (twister) {
      const allLis = twister.querySelectorAll('li');
      allLis.forEach(li => {
        if (li.classList.contains('aok-hidden')) return;
        if (li.className.includes('360')) return;
        if (li.className.includes('Ingress')) return;
        
        const btnText = li.querySelector('.a-button-text');
        let val = '';
        if (btnText) {
          val = btnText.innerText || '';
        } else {
          val = li.innerText || '';
        }
        
        val = val.split('\n')[0].trim();
        
        if (!isValidSize(val)) return;
        
        if (!seenSizes.has(val)) {
          seenSizes.add(val);
          const isUnavail = li.className.toLowerCase().includes('unavailable');
          sizeOptions.push({ value: val, available: !isUnavail });
        }
      });
    }

    if (sizeOptions.length > 0) {
      variants.push({ name: 'Size', type: 'size', options: sizeOptions });
    }

    // ============ COLOR EXTRACTION ============
    // Try multiple possible color container selectors
    const colorSelectors = [
      '#variation_color_name',
      '#tp-inline-twister-dim-values-container-color_name',
      '#inline-twister-expander-content-color_name',
      '[data-csa-c-slot-id="twister-plus-slot-color_name"]'
    ];
    
    let colorContainer = null;
    for (const sel of colorSelectors) {
      colorContainer = document.querySelector(sel);
      if (colorContainer) {
        console.log('[AMAZON] Found color container:', sel);
        break;
      }
    }

    // Also look for color swatches anywhere in twister
    if (!colorContainer && twister) {
      // Look for image swatches (common for color selection)
      const imgSwatches = twister.querySelectorAll('img[alt]');
      const colorOptions = [];
      const seenColors = new Set();
      
      imgSwatches.forEach(img => {
        const alt = img.alt || '';
        // Skip if it looks like a size or navigation
        if (!alt) return;
        if (alt.length > 50) return;
        if (/^X{0,3}[SML]$/i.test(alt)) return;
        if (/^\d+\s*X*L/i.test(alt)) return;
        if (/Previous|Next|360|View/i.test(alt)) return;
        
        // Check if parent li is not hidden
        const parentLi = img.closest('li');
        if (parentLi && parentLi.classList.contains('aok-hidden')) return;
        
        if (!seenColors.has(alt)) {
          seenColors.add(alt);
          const isUnavail = parentLi?.className.toLowerCase().includes('unavailable') || false;
          colorOptions.push({ value: alt, available: !isUnavail });
        }
      });
      
      if (colorOptions.length > 1) { // Only add if we found multiple colors
        variants.push({ name: 'Color', type: 'color', options: colorOptions });
        console.log('[AMAZON] Found colors via img swatches:', colorOptions.length);
      }
    }

    if (colorContainer) {
      const colorOptions = [];
      const seenColors = new Set();
      
      // Try getting colors from images first (more reliable)
      colorContainer.querySelectorAll('img').forEach(img => {
        const val = img.alt || img.title || '';
        if (!val) return;
        if (val.length > 50) return;
        
        const parentLi = img.closest('li');
        if (parentLi && parentLi.classList.contains('aok-hidden')) return;
        
        if (!seenColors.has(val)) {
          seenColors.add(val);
          const isUnavail = parentLi?.className.toLowerCase().includes('unavailable') || false;
          colorOptions.push({ value: val, available: !isUnavail });
        }
      });
      
      // If no images, try text content
      if (colorOptions.length === 0) {
        colorContainer.querySelectorAll('li').forEach(li => {
          if (li.classList.contains('aok-hidden')) return;
          
          let val = li.innerText?.trim() || '';
          val = val.split('\n')[0].trim();
          
          if (!val) return;
          if (val.length > 50) return;
          if (/^[€$£]/.test(val)) return;
          if (/Previous|Next|Cancel|Confirm|Select|See /i.test(val)) return;
          
          if (!seenColors.has(val)) {
            seenColors.add(val);
            const isUnavail = li.className.toLowerCase().includes('unavailable');
            colorOptions.push({ value: val, available: !isUnavail });
          }
        });
      }
      
      if (colorOptions.length > 0) {
        variants.push({ name: 'Color', type: 'color', options: colorOptions });
      }
    }

    // ============ DEBUG: Log what we found for colors ============
    console.log('[AMAZON] Color containers checked:');
    colorSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      console.log('[AMAZON]  ', sel, ':', el ? 'EXISTS' : 'NOT FOUND');
    });

    // ============ PRICE ============
    const getPrice = () => {
      const priceSpan = document.querySelector('#corePrice_feature_div .a-offscreen');
      if (priceSpan) return priceSpan.innerText?.trim();
      
      const offscreen = document.querySelector('.a-price .a-offscreen');
      if (offscreen) return offscreen.innerText?.trim();
      
      const whole = document.querySelector('.a-price-whole');
      const frac = document.querySelector('.a-price-fraction');
      if (whole && frac) {
        return whole.innerText.replace(/[^0-9]/g, '') + '.' + frac.innerText.trim();
      }
      
      return '';
    };

    const title = getText('#productTitle') || document.title;
    const image = getSrc('#landingImage') || getSrc('#imgBlkFront');
    const priceStr = getPrice();

    let inStock = true;
    const availText = (document.querySelector('#availability')?.innerText || '').toLowerCase();
    if (availText.includes('unavailable') || availText.includes('out of stock')) {
      inStock = false;
    }

    return { title, priceStr, image, inStock, variants, hasVariants: variants.length > 0 };
  });

  console.log('[AMAZON RESULT]', {
    priceStr: data.priceStr,
    title: data.title?.substring(0, 40),
    variantsFound: data.variants?.length || 0,
    sizeCount: data.variants?.find(v => v.type === 'size')?.options?.length || 0,
    colorCount: data.variants?.find(v => v.type === 'color')?.options?.length || 0,
    sizes: data.variants?.find(v => v.type === 'size')?.options?.map(o => o.value) || [],
    colors: data.variants?.find(v => v.type === 'color')?.options?.map(o => o.value) || []
  });

  return {
    title: data.title,
    price: data.priceStr,
    image: data.image,
    inStock: data.inStock,
    variants: data.variants,
    hasVariants: data.hasVariants
  };
};

const isAmazonUrl = (url) => url.includes('amazon.') || url.includes('amzn.');

module.exports = { scrapeAmazon, isAmazonUrl };

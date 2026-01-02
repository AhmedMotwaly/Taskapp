const scrapeAmazon = async (page) => {
  // Force desktop viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Wait for page to load
  try {
    await page.waitForSelector('#productTitle', { timeout: 15000 });
  } catch (e) {
    console.log("[AMAZON] Timeout waiting for product title");
  }

  // Scroll to trigger lazy-loading of variant sections
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 2500));

  const data = await page.evaluate(() => {
    const getText = (s) => document.querySelector(s)?.innerText?.trim();
    const getSrc = (s) => document.querySelector(s)?.src;

    const variants = [];

    // ========== HELPER: Check if value is pagination/noise ==========
    const isPaginationOrNoise = (val) => {
      if (!val) return true;
      
      const lowerVal = val.toLowerCase().trim();
      
      // Exact matches to skip
      const skipExact = [
        'previous', 'next', 'prev', 'back', 'forward',
        '←', '→', '«', '»', '<', '>', '...', 
        '←previous', 'next→', '← previous', 'next →',
        'show more', 'see more', 'view all', 'expand',
        'collapse', 'less', 'more'
      ];
      
      if (skipExact.includes(lowerVal)) return true;
      
      // Contains navigation arrows
      if (/[←→«»]/.test(val)) return true;
      
      // Is just a number (page number)
      if (/^\d+$/.test(val.trim())) return true;
      
      // Contains "previous" or "next" anywhere
      if (lowerVal.includes('previous') || lowerVal.includes('next')) return true;
      
      // Is too short (single character that's not a size like S, M, L)
      if (val.length === 1 && !/^[SMLX]$/i.test(val)) return true;
      
      return false;
    };

    // ========== SIZE EXTRACTION ==========
    // Strategy 1: Inline Twister Button Toggles (Amazon.de Fashion)
    const sizeExpander = document.querySelector('#inline-twister-expander-content-size_name');
    if (sizeExpander) {
      const buttonGroup = sizeExpander.querySelector('.a-button-toggle-group') || 
                          sizeExpander.querySelector('ul');
      
      if (buttonGroup) {
        const options = [];
        const seen = new Set();
        
        const items = buttonGroup.querySelectorAll('li');
        
        items.forEach(li => {
          // Skip hidden elements
          if (li.classList.contains('aok-hidden')) return;
          
          // Skip pagination elements
          if (li.classList.contains('a-pagination') || 
              li.closest('.a-pagination')) return;
          
          let val = '';
          
          const textEl = li.querySelector('.a-button-text') || 
                         li.querySelector('.a-size-base') ||
                         li.querySelector('span[class*="text"]');
          
          if (textEl) {
            val = textEl.innerText?.trim();
          }
          
          if (!val) {
            val = li.innerText?.trim();
          }
          
          if (val) {
            val = val.split('\n')[0].trim();
            val = val.replace(/€[\d.,]+/g, '').trim();
            val = val.replace(/\(.*?\)/g, '').trim();
          }
          
          // Skip pagination/noise
          if (isPaginationOrNoise(val)) return;
          
          if (val && !seen.has(val) && val.length < 30) {
            seen.add(val);
            
            const buttonEl = li.querySelector('.a-button') || li;
            const classes = (buttonEl.className || '').toLowerCase();
            const isUnavailable = classes.includes('unavailable') || 
                                  classes.includes('disabled') ||
                                  classes.includes('grey') ||
                                  li.querySelector('.a-button-unavailable') !== null;
            
            options.push({ 
              value: val, 
              available: !isUnavailable 
            });
          }
        });
        
        if (options.length > 0) {
          console.log('[AMAZON] Found sizes via inline-twister:', options.length);
          variants.push({ name: 'Size', type: 'size', options });
        }
      }
    }

    // Strategy 2: Fallback to tp-inline-twister-dim-values-container
    if (variants.filter(v => v.type === 'size').length === 0) {
      const dimContainer = document.querySelector('#tp-inline-twister-dim-values-container');
      if (dimContainer) {
        const options = [];
        const seen = new Set();
        
        const sizeButtons = dimContainer.querySelectorAll('[data-csa-c-dimension-name="size_name"]') ||
                            dimContainer.querySelectorAll('.a-button') ||
                            dimContainer.querySelectorAll('li');
        
        sizeButtons.forEach(el => {
          // Skip pagination
          if (el.classList.contains('a-pagination') || el.closest('.a-pagination')) return;
          
          let val = el.innerText?.trim()?.split('\n')[0];
          if (val) {
            val = val.replace(/€[\d.,]+/g, '').replace(/\(.*?\)/g, '').trim();
          }
          
          if (isPaginationOrNoise(val)) return;
          
          if (val && !seen.has(val) && val.length < 30) {
            seen.add(val);
            const classes = (el.className || '').toLowerCase();
            const isUnavailable = classes.includes('unavailable') || classes.includes('disabled');
            options.push({ value: val, available: !isUnavailable });
          }
        });
        
        if (options.length > 0) {
          console.log('[AMAZON] Found sizes via dim-values-container:', options.length);
          variants.push({ name: 'Size', type: 'size', options });
        }
      }
    }

    // Strategy 3: Traditional variation_size_name (older layout)
    if (variants.filter(v => v.type === 'size').length === 0) {
      const sizeContainer = document.querySelector('#variation_size_name');
      if (sizeContainer) {
        const options = [];
        const seen = new Set();
        
        sizeContainer.querySelectorAll('li').forEach(li => {
          if (li.classList.contains('aok-hidden')) return;
          if (li.classList.contains('a-pagination') || li.closest('.a-pagination')) return;
          
          let val = li.innerText?.trim();
          if (!val) {
            const img = li.querySelector('img');
            if (img) val = img.alt || img.title;
          }
          
          if (val) {
            val = val.replace(/\(.*?\)/g, '').trim();
          }
          
          if (isPaginationOrNoise(val)) return;
          
          if (val && !seen.has(val)) {
            seen.add(val);
            const cls = (li.className || '').toLowerCase();
            const isUnavailable = cls.includes('unavailable') || cls.includes('grey');
            options.push({ value: val, available: !isUnavailable });
          }
        });
        
        if (options.length > 0) {
          console.log('[AMAZON] Found sizes via variation_size_name:', options.length);
          variants.push({ name: 'Size', type: 'size', options });
        }
      }
    }

    // Strategy 4: Native dropdown (rare but exists)
    if (variants.filter(v => v.type === 'size').length === 0) {
      const sizeSelect = document.querySelector('#native_dropdown_selected_size_name') ||
                         document.querySelector('select[id*="size_name"]');
      
      if (sizeSelect && sizeSelect.tagName === 'SELECT') {
        const options = [];
        Array.from(sizeSelect.options).forEach(opt => {
          const val = opt.innerText?.trim();
          const optVal = opt.value;
          if (val && optVal !== '-1' && optVal !== '' && !val.toLowerCase().includes('select')) {
            if (isPaginationOrNoise(val)) return;
            options.push({
              value: val.replace(/\s*-\s*(?:unavailable).*/i, '').trim(),
              available: !opt.disabled
            });
          }
        });
        
        if (options.length > 0) {
          console.log('[AMAZON] Found sizes via native dropdown:', options.length);
          variants.push({ name: 'Size', type: 'size', options });
        }
      }
    }

    // ========== COLOR EXTRACTION ==========
    const colorExpander = document.querySelector('#inline-twister-expander-content-color_name') ||
                          document.querySelector('#variation_color_name');
    
    if (colorExpander) {
      const options = [];
      const seen = new Set();
      
      // Be more specific: target only actual color swatches, not pagination
      // Look for the button group or image swatches specifically
      const buttonGroup = colorExpander.querySelector('.a-button-toggle-group') ||
                          colorExpander.querySelector('#tp-inline-twister-dim-values-container') ||
                          colorExpander.querySelector('ul:not(.a-pagination)');
      
      const colorItems = buttonGroup ? 
                         buttonGroup.querySelectorAll('li:not(.a-pagination)') :
                         colorExpander.querySelectorAll('li:not(.a-pagination)');
      
      colorItems.forEach(el => {
        // Skip hidden and pagination elements
        if (el.classList.contains('aok-hidden')) return;
        if (el.classList.contains('a-pagination')) return;
        if (el.closest('.a-pagination')) return;
        
        // Check if this looks like a pagination container
        const parentClasses = (el.parentElement?.className || '').toLowerCase();
        if (parentClasses.includes('pagination')) return;
        
        let val = '';
        
        // For colors, prioritize image alt text (most reliable)
        const img = el.querySelector('img');
        if (img) {
          val = img.alt || img.title || '';
        }
        
        // Fallback to text, but be careful
        if (!val) {
          // Look for specific text containers, not just any text
          const textEl = el.querySelector('.a-button-text') || 
                         el.querySelector('.a-size-base') ||
                         el.querySelector('[class*="swatch-title"]');
          if (textEl) {
            val = textEl.innerText?.trim()?.split('\n')[0] || '';
          }
        }
        
        // Last resort: use innerText but be very careful
        if (!val) {
          // Only use innerText if the element looks like a color swatch
          // (has specific classes or attributes)
          if (el.querySelector('.a-button-inner') || 
              el.hasAttribute('data-defaultasin') ||
              el.querySelector('[data-csa-c-dimension-name="color_name"]')) {
            val = el.innerText?.trim()?.split('\n')[0] || '';
          }
        }
        
        // Clean up the value
        val = val.replace(/\(.*?\)/g, '').trim();
        val = val.replace(/€[\d.,]+/g, '').trim();
        
        // Skip pagination/noise
        if (isPaginationOrNoise(val)) return;
        
        // Additional validation for colors
        // Colors should be words, not symbols or very short strings
        if (val.length < 2) return;
        if (val.length > 50) return;
        
        if (val && !seen.has(val)) {
          seen.add(val);
          const cls = (el.className || '').toLowerCase();
          const isUnavailable = cls.includes('unavailable') || cls.includes('grey');
          options.push({ value: val, available: !isUnavailable });
        }
      });
      
      if (options.length > 0) {
        console.log('[AMAZON] Found colors:', options.length);
        variants.push({ name: 'Color', type: 'color', options });
      }
    }

    // ========== PRICE EXTRACTION ==========
    const getPrice = () => {
      const priceSelectors = [
        '.a-price .a-offscreen',
        '#corePrice_feature_div .a-offscreen',
        '.apexPriceToPay .a-offscreen',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price-whole'
      ];
      
      for (const sel of priceSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.innerText?.trim();
          if (text && text.match(/[\d.,]+/)) {
            return text;
          }
        }
      }
      
      const whole = document.querySelector('.a-price-whole');
      const frac = document.querySelector('.a-price-fraction');
      if (whole) {
        const w = whole.innerText?.replace(/[^\d]/g, '') || '0';
        const f = frac?.innerText?.trim() || '00';
        return `${w}.${f}`;
      }
      
      return null;
    };

    // ========== CORE DATA ==========
    const title = getText('#productTitle') || document.title;
    const image = getSrc('#landingImage') || getSrc('#imgBlkFront') || getSrc('#main-image');
    const priceStr = getPrice();

    let inStock = true;
    const availText = (document.querySelector('#availability')?.innerText || '').toLowerCase();
    if (availText.includes('unavailable') || availText.includes('out of stock') || availText.includes('nicht verfügbar')) {
      inStock = false;
    }

    return {
      title,
      priceStr,
      image,
      inStock,
      variants,
      hasVariants: variants.length > 0
    };
  });

  console.log('[AMAZON RESULT]', {
    priceStr: data.priceStr,
    title: data.title?.substring(0, 40),
    variantsFound: data.variants?.length || 0,
    variants: data.variants?.map(v => `${v.name}: ${v.options.length} options`) || []
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

const isAmazonUrl = (url) => {
  return url.includes('amazon.') || url.includes('amzn.');
};

module.exports = { scrapeAmazon, isAmazonUrl };
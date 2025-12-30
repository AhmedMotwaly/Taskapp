// TEST SCRIPT: test-zalando.js
// Place this in: SaaS/Backend/src/test-zalando.js
// Run with: node src/test-zalando.js

const { fetchProductDetails } = require('./services/scraperService');

async function testZalando() {
  console.log('\n========================================');
  console.log('TESTING ZALANDO SCRAPER');
  console.log('========================================\n');

  const testUrl = 'https://en.zalando.de/intimissimi-thong-blue-inl81v01h-k11.html';
  
  console.log(`Testing URL: ${testUrl}\n`);

  try {
    const result = await fetchProductDetails(testUrl);

    console.log('\n========================================');
    console.log('RESULTS:');
    console.log('========================================');
    console.log(`âœ… Title: ${result.title}`);
    console.log(`âœ… Price: â‚¬${result.price}`);
    console.log(`âœ… Image: ${result.image ? 'Found' : 'Missing'}`);
    console.log(`âœ… In Stock: ${result.inStock}`);
    console.log(`âœ… Has Variants: ${result.hasVariants}`);
    console.log(`âœ… Variants Count: ${result.variants?.length || 0}`);
    
    if (result.variants && result.variants.length > 0) {
      console.log('\n--- VARIANTS DETAILS ---');
      result.variants.forEach((variant, i) => {
        console.log(`\nVariant ${i + 1}: ${variant.name}`);
        console.log(`  Type: ${variant.type}`);
        console.log(`  Required: ${variant.required}`);
        console.log(`  Options (${variant.options?.length || 0}):`);
        
        if (variant.options && variant.options.length > 0) {
          variant.options.slice(0, 5).forEach(opt => {
            console.log(`    - ${opt.value || opt.label} ${opt.available ? 'âœ…' : 'âŒ'}`);
          });
          if (variant.options.length > 5) {
            console.log(`    ... and ${variant.options.length - 5} more`);
          }
        } else {
          console.log(`    âš ï¸ NO OPTIONS FOUND`);
        }
      });
    } else {
      console.log('\nâš ï¸ WARNING: NO VARIANTS EXTRACTED');
      console.log('This could mean:');
      console.log('  1. Zalando changed their HTML structure');
      console.log('  2. The page needs more time to load');
      console.log('  3. The selectors need updating');
    }

    console.log('\n========================================');
    console.log('TEST COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

testZalando();
const checkPrice = async (url) => {
  const mockPrice = Math.floor(Math.random() * 500) + 10;
  const mockStock = Math.random() > 0.3;
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { url, price: mockPrice, inStock: mockStock, currency: 'EUR', checkedAt: new Date().toISOString() };
};

module.exports = { checkPrice };

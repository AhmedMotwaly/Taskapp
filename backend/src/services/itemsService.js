const { v4: uuidv4 } = require('uuid');
const { putItem, queryItems, deleteItem, getItem, scanItems, TABLES } = require('../models/dynamodb');
const { validateUrl, validateMode } = require('../utils/validators');

const addItem = async (userId, { url, title, targetPrice, mode }) => {
  if (!validateUrl(url)) throw new Error('Invalid URL format');
  if (!validateMode(mode)) throw new Error('Mode must be "deal" or "restock"');
  if (targetPrice !== undefined && (typeof targetPrice !== 'number' || targetPrice < 0)) throw new Error('Target price must be a positive number');
  if (!title || title.trim().length === 0) throw new Error('Title is required');

  const itemId = uuidv4();
  const createdAt = new Date().toISOString();
  const item = { itemId, userId, url, title: title.trim(), targetPrice: targetPrice || 0, mode, lastPrice: null, lastStock: null, createdAt };

  await putItem(TABLES.ITEMS, item);
  return item;
};

const getItems = async (userId) => {
  const items = await queryItems(TABLES.ITEMS, 'userId = :userId', { ':userId': userId }, 'userId-index').catch(() => []);
  return items;
};

const deleteItemById = async (userId, itemId) => {
  const item = await getItem(TABLES.ITEMS, { itemId });
  if (!item) throw new Error('Item not found');
  if (item.userId !== userId) throw new Error('Unauthorized to delete this item');
  await deleteItem(TABLES.ITEMS, { itemId });
  return { message: 'Item deleted successfully' };
};

const getAllItems = async () => {
  const items = await scanItems(TABLES.ITEMS).catch(() => []);
  return items;
};

module.exports = { addItem, getItems, deleteItemById, getAllItems };

const updateTargetPrice = async (userId, itemId, newTargetPrice) => {
  if (typeof newTargetPrice !== 'number' || newTargetPrice < 0) {
    throw new Error('Target price must be a positive number');
  }

  const item = await getItem(TABLES.ITEMS, { itemId });
  if (!item) throw new Error('Item not found');
  if (item.userId !== userId) throw new Error('Unauthorized to update this item');

  await updateItem(
    TABLES.ITEMS,
    { itemId },
    'SET targetPrice = :targetPrice, updatedAt = :updatedAt',
    {
      ':targetPrice': newTargetPrice,
      ':updatedAt': new Date().toISOString()
    }
  );

  const updatedItem = await getItem(TABLES.ITEMS, { itemId });
  return updatedItem;
};

module.exports = { 
  addItem, 
  getItems, 
  deleteItemById, 
  getAllItems,
  updateTargetPrice // <-- Add this export
};
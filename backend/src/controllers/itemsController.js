const itemsService = require('../services/itemsService');

const addItem = async (req, res) => {
  try {
    const { url, title, targetPrice, mode } = req.body;
    const userId = req.user.userId;
    if (!url || !title || !mode) return res.status(400).json({ error: 'URL, title, and mode are required' });
    const item = await itemsService.addItem(userId, { url, title, targetPrice, mode });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const items = await itemsService.getItems(userId);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const result = await itemsService.deleteItemById(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { addItem, getItems, deleteItem };

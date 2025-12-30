const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'autobuy_';

const TABLES = {
  USERS: `${TABLE_PREFIX}users`,
  ITEMS: `${TABLE_PREFIX}items`,
  CONFIRM_TOKENS: `${TABLE_PREFIX}confirmTokens`,
  BILLING: `${TABLE_PREFIX}billing`,
  RESTOCK_ITEMS: `${TABLE_PREFIX}restockItems`,  // ADD THIS LINE
};

module.exports = { dynamoDB, TABLES };

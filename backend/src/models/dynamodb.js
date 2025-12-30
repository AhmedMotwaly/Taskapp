const AWS = require('aws-sdk');

// 1. CONFIGURE AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// 2. DEFINE TABLES
const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'autobuy_';

const TABLES = {
  USERS: `${TABLE_PREFIX}users`,
  ITEMS: `${TABLE_PREFIX}items`,
  CONFIRM_TOKENS: `${TABLE_PREFIX}confirmTokens`,
  BILLING: `${TABLE_PREFIX}billing`,
  SUBSCRIPTIONS: `${TABLE_PREFIX}subscriptions`,
  RESTOCK_ITEMS: `${TABLE_PREFIX}restockItems`, // <--- ADD THIS LINE
};

// Track daily SMS count in DynamoDB
const canSendSMS = async (userId, plan) => {
  const today = new Date().toISOString().split('T')[0];
  const count = await getSMSCount(userId, today);
  return count < SMS_DAILY_LIMIT[plan];
};

// 3. HELPER FUNCTIONS

const putItem = async (tableName, item) => {
  const params = { TableName: tableName, Item: item };
  return dynamoDB.put(params).promise();
};

const getItem = async (tableName, key) => {
  const params = { TableName: tableName, Key: key };
  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

const queryItems = async (tableName, keyConditionExpression, expressionAttributeValues, indexName = null) => {
  const params = { 
    TableName: tableName, 
    KeyConditionExpression: keyConditionExpression, 
    ExpressionAttributeValues: expressionAttributeValues 
  };
  if (indexName) params.IndexName = indexName;
  const result = await dynamoDB.query(params).promise();
  return result.Items;
};

const scanItems = async (tableName, filterExpression = null, expressionAttributeValues = null) => {
  const params = { TableName: tableName };
  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  const result = await dynamoDB.scan(params).promise();
  return result.Items;
};

const deleteItem = async (tableName, key) => {
  const params = { TableName: tableName, Key: key };
  return dynamoDB.delete(params).promise();
};

const updateItem = async (tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = null) => {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  if (expressionAttributeNames) {
    params.ExpressionAttributeNames = expressionAttributeNames;
  }

  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

// 4. EXPORT EVERYTHING
module.exports = { 
    dynamoDB, 
    TABLES, 
    putItem, 
    getItem, 
    queryItems, 
    scanItems, 
    deleteItem, 
    updateItem 
};
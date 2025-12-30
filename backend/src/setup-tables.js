// setup-tables.js
require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB();
const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'autobuy_';

const tables = [
  {
    TableName: `${TABLE_PREFIX}users`,
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    }],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
  },
  {
    TableName: `${TABLE_PREFIX}items`,
    KeySchema: [{ AttributeName: 'itemId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'itemId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'userId-index',
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    }],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
  },
  // Simple table for billing
  {
    TableName: `${TABLE_PREFIX}billing`,
    KeySchema: [{ AttributeName: 'invoiceId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'invoiceId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'userId-index',
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    }],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
  },
  // Subscriptions table
  {
    TableName: `${TABLE_PREFIX}subscriptions`,
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
  }
];

const createTables = async () => {
  console.log('Creating DynamoDB tables...');
  for (const table of tables) {
    try {
      await dynamodb.createTable(table).promise();
      console.log(`✅ Created table: ${table.TableName}`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`⚠️ Table already exists: ${table.TableName}`);
      } else {
        console.error(`❌ Error creating ${table.TableName}:`, error.message);
      }
    }
  }
};

createTables();
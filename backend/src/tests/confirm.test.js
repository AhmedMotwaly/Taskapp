const request = require('supertest');
const app = require('../app');

describe('Confirm Routes', () => {
  let authToken;

  beforeAll(async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send({
        email: `testconfirm${Date.now()}@example.com`,
        password: 'password123',
      });

    authToken = response.body.data.token;
  });

  describe('POST /check-price', () => {
    it('should return price info for valid URL', async () => {
      const response = await request(app)
        .post('/check-price')
        .send({
          url: 'https://example.com/product',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('price');
      expect(response.body.data).toHaveProperty('inStock');
      expect(response.body.data).toHaveProperty('currency');
    });

    it('should return error without URL', async () => {
      const response = await request(app).post('/check-price').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /confirm/create', () => {
    let itemId;

    beforeEach(async () => {
      const itemResponse = await request(app)
        .post('/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/product',
          title: 'Test Product',
          mode: 'deal',
        });

      itemId = itemResponse.body.data.itemId;
    });

    it('should create a confirm token', async () => {
      const response = await request(app)
        .post('/confirm/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('expiresAt');
    });
  });

  describe('POST /confirm', () => {
    let confirmToken;

    beforeEach(async () => {
      const itemResponse = await request(app)
        .post('/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/product',
          title: 'Test Product',
          mode: 'deal',
        });

      const tokenResponse = await request(app)
        .post('/confirm/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: itemResponse.body.data.itemId,
        });

      confirmToken = tokenResponse.body.data.token;
    });

    it('should confirm purchase with valid token', async () => {
      const response = await request(app).post('/confirm').send({
        token: confirmToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app).post('/confirm').send({
        token: 'invalid-token',
      });

      expect(response.status).toBe(400);
    });
  });
});

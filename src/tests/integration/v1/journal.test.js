/**
 * Journal API integration tests
 */
const request = require('supertest');
const app = require('../../../../src/app');
const jwt = require('jsonwebtoken');
const config = require('../../../../src/config/config');

// Mock the database models
jest.mock('../../../../src/database/models', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  
  // Mock TradeJournalEntry model
  const TradeJournalEntry = dbMock.define('TradeJournalEntry', {
    id: 'mock-trade-id-123',
    userId: 'mock-user-id-123',
    instrument: 'AAPL',
    direction: 'Long',
    entryDateTime: new Date('2025-06-01T10:30:00Z'),
    actualEntryPrice: '185.75',
    quantity: 10,
    executionDate: '2025-06-01',
    assetClass: 'Equity',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Mock UserCustomTag model
  const UserCustomTag = dbMock.define('UserCustomTag', {
    id: 'mock-tag-id-123',
    userId: 'mock-user-id-123',
    tagName: 'Breakout',
    tagType: 'strategy',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Mock User model
  const User = dbMock.define('User', {
    id: 'mock-user-id-123',
    firstName: 'Journal',
    lastName: 'Tester',
    email: 'journal.tester@example.com',
    password: 'hashedpassword',
    role: 'user',
    isEmailVerified: true,
    isActive: true
  });
  
  return {
    TradeJournalEntry,
    UserCustomTag,
    User,
    sequelize: dbMock
  };
});

// Mock JWT authentication middleware
jest.mock('../../../../src/core/middlewares/authenticate', () => () => (req, res, next) => {
  req.user = { id: 'mock-user-id-123', email: 'journal.tester@example.com', role: 'user' };
  next();
});

describe('Journal API', () => {
  let userToken;
  
  beforeAll(() => {
    // Generate a mock token
    userToken = jwt.sign(
      { id: 'mock-user-id-123', email: 'journal.tester@example.com', role: 'user' },
      config.jwt.secret || 'mockjwtsecret',
      { expiresIn: '1d' }
    );
  });
  
  /**
   * Trade Journal Entry tests
   */
  describe('Trade Journal Entries', () => {
    describe('POST /api/v1/journal/trades', () => {
      it('should create a new trade entry', async () => {
        const newTrade = {
          instrument: 'AAPL',
          direction: 'Long',
          entryDateTime: '2025-06-01T10:30:00Z',
          actualEntryPrice: 185.75,
          quantity: 10,
          executionDate: '2025-06-01',
          assetClass: 'Equity'
        };
        
        // Mock the service response
        jest.spyOn(require('../../../../src/api/v1/journal/journal.service'), 'createTradeEntry')
          .mockResolvedValue({
            id: 'mock-trade-id-123',
            userId: 'mock-user-id-123',
            ...newTrade,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        
        const res = await request(app)
          .post('/api/v1/journal/trades')
          .set('Authorization', `Bearer ${userToken}`)
          .send(newTrade);
        
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('instrument', newTrade.instrument);
      });
    });
    
    describe('GET /api/v1/journal/trades', () => {
      it('should get all trade entries for the user', async () => {
        // Mock the service response
        jest.spyOn(require('../../../../src/api/v1/journal/journal.service'), 'getTradeEntries')
          .mockResolvedValue({
            data: [
              {
                id: 'mock-trade-id-123',
                userId: 'mock-user-id-123',
                instrument: 'AAPL',
                direction: 'Long',
                entryDateTime: new Date('2025-06-01T10:30:00Z'),
                actualEntryPrice: '185.75',
                quantity: 10,
                executionDate: '2025-06-01',
                assetClass: 'Equity'
              }
            ],
            meta: {
              total: 1,
              totalPages: 1,
              currentPage: 1,
              limit: 10
            }
          });
        
        const res = await request(app)
          .get('/api/v1/journal/trades')
          .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.meta).toHaveProperty('total');
      });
    });
  });
  
  /**
   * User Custom Tag tests
   */
  describe('User Custom Tags', () => {
    describe('POST /api/v1/journal/tags', () => {
      it('should create a new custom tag', async () => {
        const newTag = {
          tagName: 'Breakout',
          tagType: 'strategy'
        };
        
        // Mock the service response
        jest.spyOn(require('../../../../src/api/v1/journal/journal.service'), 'createUserCustomTag')
          .mockResolvedValue({
            id: 'mock-tag-id-123',
            userId: 'mock-user-id-123',
            ...newTag,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        
        const res = await request(app)
          .post('/api/v1/journal/tags')
          .set('Authorization', `Bearer ${userToken}`)
          .send(newTag);
        
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('tagName', newTag.tagName);
        expect(res.body.data).toHaveProperty('tagType', newTag.tagType);
      });
    });
    
    describe('GET /api/v1/journal/tags', () => {
      it('should get all tags by type', async () => {
        // Mock the service response
        jest.spyOn(require('../../../../src/api/v1/journal/journal.service'), 'getUserCustomTags')
          .mockResolvedValue([
            {
              id: 'mock-tag-id-123',
              userId: 'mock-user-id-123',
              tagName: 'Breakout',
              tagType: 'strategy',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]);
        
        const res = await request(app)
          .get('/api/v1/journal/tags?type=strategy')
          .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        
        // Verify tag type
        if (res.body.data.length > 0) {
          expect(res.body.data[0].tagType).toBe('strategy');
        }
      });
    });
  });
});

/**
 * User API integration tests
 */
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../../src/app');
const db = require('../../../../src/database/models');
const { hashPassword } = require('../../../../src/core/utils/passwordUtils');
const jwt = require('jsonwebtoken');
const config = require('../../../../src/config/config');

describe('User API', () => {
  let adminToken, userToken, adminUser, regularUser;
  
  // Setup test data before tests
  before(async () => {
    // Clear users table
    await db.User.destroy({ where: {}, force: true });
    
    // Create admin user
    adminUser = await db.User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: await hashPassword('Admin123!'),
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });
    
    // Create regular user
    regularUser = await db.User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      password: await hashPassword('User123!'),
      role: 'user',
      isEmailVerified: true,
      isActive: true,
    });
    
    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      config.jwt.secret,
      { expiresIn: '1d' }
    );
    
    userToken = jwt.sign(
      { id: regularUser.id, email: regularUser.email, role: regularUser.role },
      config.jwt.secret,
      { expiresIn: '1d' }
    );
  });
  
  after(async () => {
    // Clean up after tests
    await db.User.destroy({ where: {}, force: true });
  });
  
  describe('POST /api/v1/users', () => {
    it('should create a new user when admin is authenticated', async () => {
      const newUser = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'NewUser123!',
        role: 'user',
      };
      
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);
      
      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('id');
      expect(res.body.data).to.have.property('email', newUser.email);
      expect(res.body.data).to.not.have.property('password');
    });
    
    it('should not allow regular users to create users', async () => {
      const newUser = {
        firstName: 'Another',
        lastName: 'User',
        email: 'anotheruser@example.com',
        password: 'AnotherUser123!',
      };
      
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newUser);
      
      expect(res.status).to.equal(403);
      expect(res.body.status).to.equal('error');
    });
  });
  
  describe('GET /api/v1/users', () => {
    it('should return paginated users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.be.an('array');
      expect(res.body.meta).to.have.property('total');
      expect(res.body.meta).to.have.property('totalPages');
      expect(res.body.meta).to.have.property('currentPage');
    });
    
    it('should not allow regular users to list all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).to.equal(403);
      expect(res.body.status).to.equal('error');
    });
  });
  
  describe('GET /api/v1/users/:id', () => {
    it('should return user by ID for admin', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('id', regularUser.id);
    });
    
    it('should allow users to retrieve their own profile', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('id', regularUser.id);
    });
  });
  
  describe('PUT /api/v1/users/:id', () => {
    it('should update user when admin is authenticated', async () => {
      const updateData = {
        firstName: 'UpdatedName',
      };
      
      const res = await request(app)
        .put(`/api/v1/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('firstName', updateData.firstName);
    });
    
    it('should allow users to update their own profile', async () => {
      const updateData = {
        lastName: 'UpdatedLastName',
      };
      
      const res = await request(app)
        .put(`/api/v1/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('lastName', updateData.lastName);
    });
    
    it('should not allow users to update other profiles', async () => {
      const updateData = {
        firstName: 'Hacked',
      };
      
      const res = await request(app)
        .put(`/api/v1/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);
      
      expect(res.status).to.equal(403);
      expect(res.body.status).to.equal('error');
    });
  });
  
  describe('DELETE /api/v1/users/:id', () => {
    it('should soft delete user when admin is authenticated', async () => {
      // Create a user to delete
      const userToDelete = await db.User.create({
        firstName: 'Delete',
        lastName: 'Me',
        email: 'delete@example.com',
        password: await hashPassword('Delete123!'),
        role: 'user',
      });
      
      const res = await request(app)
        .delete(`/api/v1/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      
      // Verify user is soft deleted
      const deletedUser = await db.User.findByPk(userToDelete.id, { paranoid: false });
      expect(deletedUser.deletedAt).to.not.be.null;
    });
    
    it('should not allow regular users to delete users', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).to.equal(403);
      expect(res.body.status).to.equal('error');
    });
  });
  
  describe('PATCH /api/v1/users/:id/restore', () => {
    it('should restore a deleted user when admin is authenticated', async () => {
      // Create and delete a user
      const userToRestore = await db.User.create({
        firstName: 'Restore',
        lastName: 'Me',
        email: 'restore@example.com',
        password: await hashPassword('Restore123!'),
        role: 'user',
      });
      
      await userToRestore.destroy(); // Soft delete
      
      const res = await request(app)
        .patch(`/api/v1/users/${userToRestore.id}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      
      // Verify user is restored
      const restoredUser = await db.User.findByPk(userToRestore.id);
      expect(restoredUser).to.not.be.null;
      expect(restoredUser.deletedAt).to.be.null;
    });
    
    it('should not allow regular users to restore users', async () => {
      // Create and delete a user
      const userToRestore = await db.User.create({
        firstName: 'Another',
        lastName: 'Restore',
        email: 'another.restore@example.com',
        password: await hashPassword('Restore123!'),
        role: 'user',
      });
      
      await userToRestore.destroy(); // Soft delete
      
      const res = await request(app)
        .patch(`/api/v1/users/${userToRestore.id}/restore`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).to.equal(403);
      expect(res.body.status).to.equal('error');
    });
  });
  
  describe('GET /api/v1/users/me', () => {
    it('should return the authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('id', regularUser.id);
      expect(res.body.data).to.have.property('email', regularUser.email);
    });
    
    it('should not allow access without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/me');
      
      expect(res.status).to.equal(401);
      expect(res.body.status).to.equal('error');
    });
  });
});

 /**
 * User service unit tests
 */
const { expect } = require('chai');
const sinon = require('sinon');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const userService = require('../../../../src/api/v1/users/users.service');
const db = require('../../../../src/database/models');
const ApiError = require('../../../../src/core/utils/ApiError');

describe('User Service', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  describe('createUser', () => {
    it('should create a new user when email is not taken', async () => {
      // Setup
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user',
      };
      
      const userModel = {
        toJSON: () => ({
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'user',
          password: 'hashedPassword',
          refreshToken: 'token',
        }),
      };
      
      sandbox.stub(db.User, 'findOne').resolves(null);
      sandbox.stub(db.User, 'create').resolves(userModel);
      
      // Execute
      const result = await userService.createUser(userData);
      
      // Assert
      expect(db.User.findOne.calledOnce).to.be.true;
      expect(db.User.create.calledOnceWithExactly(userData)).to.be.true;
      expect(result).to.have.property('id');
      expect(result).to.have.property('email', 'john@example.com');
      expect(result).to.not.have.property('password');
      expect(result).to.not.have.property('refreshToken');
    });
    
    it('should throw error when email is already taken', async () => {
      // Setup
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'Password123!',
      };
      
      sandbox.stub(db.User, 'findOne').resolves({ id: '123', email: 'existing@example.com' });
      
      // Execute & Assert
      try {
        await userService.createUser(userData);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(StatusCodes.BAD_REQUEST);
        expect(error.message).to.include('already exists');
      }
    });
  });
  
  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      // Setup
      const filter = { isActive: true };
      const options = { limit: 10, page: 1 };
      
      const users = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' },
      ];
      
      sandbox.stub(db.User, 'findAndCountAll').resolves({
        count: 2,
        rows: users,
      });
      
      // Execute
      const result = await userService.getUsers(filter, options);
      
      // Assert
      expect(db.User.findAndCountAll.calledOnce).to.be.true;
      expect(result).to.have.property('users').with.lengthOf(2);
      expect(result).to.have.property('pagination');
      expect(result.pagination).to.have.property('total', 2);
      expect(result.pagination).to.have.property('totalPages', 1);
      expect(result.pagination).to.have.property('currentPage', 1);
    });
  });
  
  describe('getUserById', () => {
    it('should return user if found', async () => {
      // Setup
      const userId = '123';
      const user = { id: userId, firstName: 'John', lastName: 'Doe' };
      
      sandbox.stub(db.User, 'findByPk').resolves(user);
      
      // Execute
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(db.User.findByPk.calledOnce).to.be.true;
      expect(result).to.deep.equal(user);
    });
    
    it('should throw error if user not found', async () => {
      // Setup
      const userId = '999';
      
      sandbox.stub(db.User, 'findByPk').resolves(null);
      
      // Execute & Assert
      try {
        await userService.getUserById(userId);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(StatusCodes.NOT_FOUND);
      }
    });
  });
  
  describe('updateUser', () => {
    it('should update and return user if found', async () => {
      // Setup
      const userId = '123';
      const updateData = { firstName: 'Updated' };
      
      const user = {
        id: userId,
        firstName: 'John',
        update: sandbox.stub().resolves(),
      };
      
      const updatedUser = {
        id: userId,
        firstName: 'Updated',
      };
      
      sandbox.stub(db.User, 'findByPk')
        .onFirstCall().resolves(user)
        .onSecondCall().resolves(updatedUser);
      
      // Execute
      const result = await userService.updateUser(userId, updateData);
      
      // Assert
      expect(db.User.findByPk.calledTwice).to.be.true;
      expect(user.update.calledOnceWithExactly(updateData)).to.be.true;
      expect(result).to.deep.equal(updatedUser);
    });
  });
  
  describe('deleteUser', () => {
    it('should delete user if found', async () => {
      // Setup
      const userId = '123';
      
      const user = {
        id: userId,
        destroy: sandbox.stub().resolves(),
      };
      
      sandbox.stub(db.User, 'findByPk').resolves(user);
      
      // Execute
      const result = await userService.deleteUser(userId);
      
      // Assert
      expect(db.User.findByPk.calledOnce).to.be.true;
      expect(user.destroy.calledOnce).to.be.true;
      expect(result).to.be.true;
    });
  });
  
  describe('restoreUser', () => {
    it('should restore a deleted user', async () => {
      // Setup
      const userId = '123';
      
      const deletedUser = {
        id: userId,
        deletedAt: new Date(),
        restore: sandbox.stub().resolves(),
      };
      
      const restoredUser = { id: userId, firstName: 'John' };
      
      sandbox.stub(db.User, 'findByPk')
        .onFirstCall().resolves(deletedUser)
        .onSecondCall().resolves(restoredUser);
      
      // Execute
      const result = await userService.restoreUser(userId);
      
      // Assert
      expect(db.User.findByPk.callCount).to.be.at.least(1);
      expect(deletedUser.restore.calledOnce).to.be.true;
      expect(result).to.deep.equal(restoredUser);
    });
  });
});

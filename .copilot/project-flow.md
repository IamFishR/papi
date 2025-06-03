
# Feature Development Guide

This document outlines the step-by-step process for adding new features to the API. Following this structured approach ensures consistency across the codebase and maintains separation of concerns.

## Table of Contents
- [Overview](#overview)
- [Step 1: Define the Database Model](#step-1-define-the-database-model)
- [Step 2: Create Validation Schemas](#step-2-create-validation-schemas)
- [Step 3: Implement Service Layer](#step-3-implement-service-layer)
- [Step 4: Build the Controller](#step-4-build-the-controller)
- [Step 5: Define Routes](#step-5-define-routes)
- [Step 6: Register Routes in API Index](#step-6-register-routes-in-api-index)
- [Step 7: Write Tests](#step-7-write-tests)
- [Step 8: Documentation](#step-8-documentation)

## Overview

Each feature in our API follows a modular structure with distinct responsibilities:
- **Model**: Database schema and relationships
- **Validation**: Request data validation
- **Service**: Business logic and data operations
- **Controller**: Request handling and response formatting
- **Route**: Endpoint definitions and middleware application

## Step 1: Define the Database Model

1. Create a new model file in `src/database/models/`
2. Define the schema with proper data types, validations, and indexes
3. Set up associations with other models in the same file
4. Register the model in `src/database/models/index.js`

Example:
```javascript
module.exports = (sequelize, DataTypes) => {
  const Feature = sequelize.define('Feature', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    // Other fields...
  }, {
    paranoid: true, // For soft delete support
    timestamps: true
  });

  Feature.associate = (models) => {
    // Define associations
    Feature.belongsTo(models.User);
  };

  return Feature;
};
```

## Step 2: Create Validation Schemas

1. Create a validation file in the feature directory: `src/api/v1/feature/feature.validation.js`
2. Define validation schemas for each API operation (create, update, etc.)
3. Use Joi or express-validator for schema definition

Example:
```javascript
const Joi = require('joi');

const createSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(50),
    description: Joi.string().optional().max(500),
    status: Joi.string().valid('active', 'inactive').default('active'),
    // Other validations...
  })
};

const updateSchema = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object().keys({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(500),
    status: Joi.string().valid('active', 'inactive'),
    // Other validations...
  }).min(1)
};

// Other schemas (get, delete, list, etc.)

module.exports = {
  createSchema,
  updateSchema,
  // Export other schemas
};
```

## Step 3: Implement Service Layer

1. Create a service file: `src/api/v1/feature/feature.service.js`
2. Implement business logic for all operations
3. Handle database interactions through the model
4. Manage any complex operations or side effects

Example:
```javascript
const { Feature } = require('../../../database/models');
const { AppError } = require('../../../core/utils/AppError');
const httpStatus = require('http-status-codes');

/**
 * Create a new feature
 * @param {Object} featureData - Feature creation data
 * @returns {Promise<Feature>}
 */
const createFeature = async (featureData) => {
  // Check if feature with same name exists
  const existingFeature = await Feature.findOne({ 
    where: { name: featureData.name } 
  });
  
  if (existingFeature) {
    throw new AppError('Feature with this name already exists', httpStatus.CONFLICT);
  }
  
  return Feature.create(featureData);
};

/**
 * Get feature by id
 * @param {string} id - Feature ID
 * @returns {Promise<Feature>}
 */
const getFeatureById = async (id) => {
  const feature = await Feature.findByPk(id);
  
  if (!feature) {
    throw new AppError('Feature not found', httpStatus.NOT_FOUND);
  }
  
  return feature;
};

// Implement other service methods (update, delete, list, etc.)

module.exports = {
  createFeature,
  getFeatureById,
  // Export other methods
};
```

## Step 4: Build the Controller

1. Create a controller file: `src/api/v1/feature/feature.controller.js`
2. Implement route handlers that call service methods
3. Format responses using the standardized response utility
4. Use catchAsync to handle promise rejections

Example:
```javascript
const featureService = require('./feature.service');
const { catchAsync } = require('../../../core/utils/catchAsync');
const { apiResponse } = require('../../../core/utils/apiResponse');
const httpStatus = require('http-status-codes');

const createFeature = catchAsync(async (req, res) => {
  const feature = await featureService.createFeature(req.body);
  return apiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Feature created successfully',
    data: feature
  });
});

const getFeature = catchAsync(async (req, res) => {
  const feature = await featureService.getFeatureById(req.params.id);
  return apiResponse(res, {
    statusCode: httpStatus.OK,
    data: feature
  });
});

// Implement other controller methods (update, delete, list, etc.)

module.exports = {
  createFeature,
  getFeature,
  // Export other methods
};
```

## Step 5: Define Routes

1. Create a route file: `src/api/v1/feature/feature.route.js`
2. Define all endpoints with their HTTP methods
3. Apply middleware (authentication, validation, etc.)
4. Connect routes to controller methods

Example:
```javascript
const express = require('express');
const featureController = require('./feature.controller');
const featureValidation = require('./feature.validation');
const { authenticate } = require('../../../core/middlewares/authenticate');
const { authorize } = require('../../../core/middlewares/authorize');
const { validate } = require('../../../core/middlewares/requestValidator');

const router = express.Router();

router
  .route('/')
  .post(
    authenticate,
    authorize(['admin']),
    validate(featureValidation.createSchema),
    featureController.createFeature
  )
  .get(
    authenticate,
    featureController.listFeatures
  );

router
  .route('/:id')
  .get(
    authenticate,
    validate(featureValidation.getSchema),
    featureController.getFeature
  )
  .put(
    authenticate,
    authorize(['admin']),
    validate(featureValidation.updateSchema),
    featureController.updateFeature
  )
  .delete(
    authenticate,
    authorize(['admin']),
    validate(featureValidation.deleteSchema),
    featureController.deleteFeature
  );

// Define other routes as needed

module.exports = router;
```

## Step 6: Register Routes in API Index

1. Import the feature routes in the API version index file:
   - For v1: index.js
2. Register the routes with the appropriate base path

Example:
```javascript
const express = require('express');
const authRoutes = require('./auth/auth.route');
const userRoutes = require('./users/users.route');
const featureRoutes = require('./feature/feature.route');
// Import other route modules

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/features', featureRoutes);
// Register other routes

module.exports = router;
```

## Step 7: Write Tests

1. Create unit tests for the service methods:
   - `src/tests/unit/services/feature.service.test.js`
2. Create integration tests for the API endpoints:
   - `src/tests/integration/v1/feature.test.js`
3. Create fixtures for test data if needed:
   - `src/tests/fixtures/feature.fixture.js`

Example unit test:
```javascript
const { expect } = require('chai');
const sinon = require('sinon');
const { Feature } = require('../../../src/database/models');
const featureService = require('../../../src/api/v1/feature/feature.service');
const { AppError } = require('../../../src/core/utils/AppError');

describe('Feature Service', () => {
  let findOneStub;
  let createStub;

  beforeEach(() => {
    findOneStub = sinon.stub(Feature, 'findOne');
    createStub = sinon.stub(Feature, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createFeature', () => {
    it('should create a feature successfully', async () => {
      // Arrange
      const featureData = { name: 'Test Feature' };
      const createdFeature = { id: '123', ...featureData };
      
      findOneStub.resolves(null);
      createStub.resolves(createdFeature);
      
      // Act
      const result = await featureService.createFeature(featureData);
      
      // Assert
      expect(result).to.deep.equal(createdFeature);
      expect(findOneStub.calledOnce).to.be.true;
      expect(createStub.calledOnce).to.be.true;
    });

    it('should throw error if feature with same name exists', async () => {
      // Arrange
      const featureData = { name: 'Test Feature' };
      const existingFeature = { id: '123', ...featureData };
      
      findOneStub.resolves(existingFeature);
      
      // Act & Assert
      try {
        await featureService.createFeature(featureData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);
        expect(error.statusCode).to.equal(409);
        expect(findOneStub.calledOnce).to.be.true;
        expect(createStub.called).to.be.false;
      }
    });
  });

  // More test cases for other service methods
});
```

## Step 8: Documentation

1. Update API documentation:
   - Add the new endpoints to the API documentation
   - Document request/response formats and examples
   - Update any relevant diagrams or flow charts

2. Update the README if necessary:
   - Add information about the new feature
   - Update usage examples

Following these steps ensures consistent implementation of features across the API and makes the codebase easier to maintain and extend.

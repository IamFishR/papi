/**
 * API v2 routes (placeholder for future version)
 */
const express = require('express');
const { StatusCodes } = require('http-status-codes');

const router = express.Router();

// Placeholder route for v2 API
router.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'API v2 is under development',
    version: 'v2',
  });
});

module.exports = router;

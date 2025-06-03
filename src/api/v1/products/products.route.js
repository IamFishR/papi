/**
 * Products routes
 */
const express = require('express');
const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({ message: 'GET /products - Get all products' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `GET /products/${req.params.id} - Get product by ID` });
});

router.post('/', (req, res) => {
  res.json({ message: 'POST /products - Create a new product' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: `PATCH /products/${req.params.id} - Update product` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `DELETE /products/${req.params.id} - Delete product` });
});

module.exports = router;

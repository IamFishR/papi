const express = require('express');
const journalRoute = require('./journal.route');

const router = express.Router();

router.use('/journal', journalRoute);

module.exports = router;

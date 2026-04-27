const express = require('express');
const router = express.Router();
const { getPublishedEvents } = require('../controllers/eventController');

router.get('/published', getPublishedEvents);

module.exports = router;

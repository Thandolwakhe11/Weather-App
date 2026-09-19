const express = require('express');
const { getWeatherByCity } = require('../controllers/weatherController');

const router = express.Router();

router.get('/', getWeatherByCity);

module.exports = router;

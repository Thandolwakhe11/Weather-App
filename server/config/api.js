const axios = require('axios');

const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 5000,
});

module.exports = weatherApi;

const weatherApi = require('../config/api');

const getWeatherByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }

    const response = await weatherApi.get('/weather', {
      params: {
        q: city,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    
// 5-day forecast
    const forecastRes = await weatherApi.get('/forecast', {
      params: {
        q: city,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric',
        cnt: 5 
      }
    });

    const forecastData = forecastRes.data.list.map(f => ({
      date: f.dt_txt,
      temperature: f.main.temp,
      description: f.weather[0].description,
      icon: f.weather[0].icon
    }));

    const weatherData = {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed
    };

    res.json(weatherData);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};

module.exports = { getWeatherByCity };

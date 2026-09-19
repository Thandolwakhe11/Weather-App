const weatherApi = require('../config/api');

const weatherSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Weather socket connected:', socket.id);

    const timers = {};
   
    //  WEATHER BY CITY 
   
    socket.on('getWeather', (city) => {
      const fetchWeather = async () => {
        try {
          const response = await weatherApi.get('/weather', {
            params: {
              q: city,
              appid: process.env.WEATHER_API_KEY,
              units: 'metric'
            }
          });

          const forecastRes = await weatherApi.get('/forecast', {
            params: {
              q: city,
              appid: process.env.WEATHER_API_KEY,
              units: 'metric',
              cnt: 5
            }
          });

          const data = response.data;

          const forecastData = forecastRes.data.list.map(f => ({
            date: f.dt_txt,
            temperature: f.main.temp,
            description: f.weather[0].description,
            icon: f.weather[0].icon
          }));

          socket.emit('weatherUpdate', {
            city: data.name,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            forecast: forecastData
          });

        } catch (error) {
          socket.emit('weatherError', 'Unable to fetch weather');
        }
      };

      // Initial fetch
      fetchWeather();

      // Auto-refresh every 5 minutes
      if (timers[city]) clearInterval(timers[city]);
      timers[city] = setInterval(fetchWeather, 5 * 60 * 1000);
    });

     //  WEATHER BY COORDINATES (UPDATED)
    
    socket.on('getWeatherByCoords', async ({ latitude, longitude }) => {
      const cityKey = `${latitude},${longitude}`; 

      const fetchWeather = async () => {
        try {
          const response = await weatherApi.get('/weather', {
            params: {
              lat: latitude,
              lon: longitude,
              appid: process.env.WEATHER_API_KEY,
              units: 'metric'
            }
          });

          const forecastRes = await weatherApi.get('/forecast', {
            params: {
              lat: latitude,
              lon: longitude,
              appid: process.env.WEATHER_API_KEY,
              units: 'metric',
              cnt: 5
            }
          });

          const data = response.data;
          const forecastData = forecastRes.data.list.map(f => ({
            date: f.dt_txt,
            temperature: f.main.temp,
            description: f.weather[0].description,
            icon: f.weather[0].icon
          }));

          socket.emit('weatherUpdate', {
            city: data.name,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            forecast: forecastData
          });

        } catch (error) {
          socket.emit('weatherError', 'Location weather failed');
        }
      };

      // Initial fetch
      fetchWeather();

      // Auto-refresh every 5 minutes
      if (timers[cityKey]) clearInterval(timers[cityKey]);
      timers[cityKey] = setInterval(fetchWeather, 5 * 60 * 1000);
    });

    
    //  DISCONNECT CLEANUP
    
    socket.on('disconnect', () => {
      Object.values(timers).forEach(clearInterval);
      console.log('Client disconnected');
    });
  });
};

module.exports = weatherSocket;

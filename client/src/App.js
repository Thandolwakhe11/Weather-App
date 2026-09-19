import React, { useState, useEffect } from 'react'; 
import { io } from 'socket.io-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './index.css';

const socket = io('http://localhost:5001');

function App() {
  const [city, setCity] = useState('');
  const [weatherCards, setWeatherCards] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  //  Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  //  Clear old search on refresh
  useEffect(() => {
    setWeatherCards([]);
  }, []);
  
  //  Location weather
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('getWeatherByCoords', { latitude, longitude });
      },
      () => console.log('Location permission denied')
    );
  }, []);

  //  Socket listeners
  useEffect(() => {
    socket.on('weatherUpdate', (data) => {
      const updatedData = {
        ...data,
        lastUpdated: new Date().toLocaleTimeString()
      };

      setWeatherCards([updatedData]); // latest search only
      setLoading(false);
      setError('');
    });

    socket.on('weatherError', (msg) => {
      setError(msg);
      setLoading(false);
    });

    return () => {
      socket.off('weatherUpdate');
      socket.off('weatherError');
    };
  }, []);

  const getWeather = () => {
    if (!city) return alert('Please enter a city');
    setLoading(true);
    socket.emit('getWeather', city);
    setCity('');
  };

  return (
    <div className="app-container">
      <h1>Weather App 🌦️</h1>

      {/*  Theme buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setTheme('light')}>🌤 Light</button>
        <button onClick={() => setTheme('blue')}>🌊 Blue</button>
        <button onClick={() => setTheme('sunny')}>☀️ Sunny</button>
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeather} disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {loading && <div className="spinner"></div>}
      {error && <p className="error-message">{error}</p>}

      <div className="weather-cards">
        {weatherCards.map((w) => {
          // hourlyData scoped correctly for the chart
          const hourlyData = w.forecast?.map(f => ({
            time: f.date.split(' ')[1]?.slice(0, 5),
            temp: f.temperature
          }));

          // Day-of-week  above city
          const dayOfWeek = w.forecast?.length
            ? new Date(w.forecast[0].date).toLocaleDateString('en-US', { weekday: 'long' })
            : '';

          return (
            <div key={w.city} className="weather-card">
              <div className="weather-card-sections">

                {/*  City Info */}
                <div className="city-info">
                  {dayOfWeek && (
                    <p
                      style={{
                        fontWeight: 'bold',
                        fontSize: '20px',
                        marginBottom: '5px',
                        color: theme === 'light' ? '#4facfe' :
                               theme === 'blue' ? '#2bc0e4' :
                               '#ff9800'
                      }}
                    >
                      {dayOfWeek}
                    </p>
                  )}
                  <h2>{w.city}</h2>
                  <p>{w.description}</p>
                  <div className="icon-wrapper">
                    <img
                      src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`}
                      alt={w.description}
                      className="weather-icon"
                    />
                  </div>
                  <p>🌡 {w.temperature}°C</p>
                  <p>🤗 Feels Like: {w.feelsLike}°C</p>
                  <p>💧 Humidity: {w.humidity}%</p>
                  <p>🌬 Wind: {w.windSpeed} m/s</p>
                  <p className="updated-time">Updated: {w.lastUpdated}</p>
                </div>

                {/* 2️ Hourly Forecast Chart */}
                <div className="hourly-chart">
                  <h4>Hourly Forecast 📊</h4>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <LineChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis unit="°C" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          stroke="#4da6ff"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          isAnimationActive
                          animationDuration={1200}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3️ 5-Day Forecast */}
                <div className="five-day-forecast">
                  <h4>5-Day Forecast</h4>
                  <div className="forecast">
                    {w.forecast?.map((f, i) => {
                      const dateObj = new Date(f.date);
                      const fullDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
                      return (
                        <div key={i} className="forecast-item">
                          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{fullDate}</p>
                          <img
                            src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`}
                            alt={f.description}
                          />
                          <p>{f.temperature}°C</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

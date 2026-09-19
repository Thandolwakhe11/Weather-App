const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const weatherRoutes = require('./routes/weatherRoutes');
const weatherSocket = require('./sockets/weatherSocket');

require('dotenv').config();


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/weather', weatherRoutes);

app.get('/', (req, res) => {
  res.send('Weather API running 🚀');
});


weatherSocket(io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
// const sequelize = require('./sequelize');
// const models = require('./models');
const http = require('http');
const { Server } = require('socket.io');
const connectMongo = require('./mongo');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Watch party namespace
io.of('/watchparty').on('connection', (socket) => {
  // Join a party room
  socket.on('join', ({ partyId, userId }) => {
    socket.join(partyId);
    io.of('/watchparty').to(partyId).emit('user-joined', { userId });
  });

  // Sync video state (play, pause, seek)
  socket.on('sync', ({ partyId, action, time }) => {
    socket.to(partyId).emit('sync', { action, time });
  });

  // Real-time chat
  socket.on('chat', ({ partyId, userId, message }) => {
    io.of('/watchparty').to(partyId).emit('chat', { userId, message });
  });

  // (Optional) Cursor indicator
  socket.on('cursor', ({ partyId, userId, time }) => {
    socket.to(partyId).emit('cursor', { userId, time });
  });
});

app.get('/', (req, res) => {
  res.send('CodeCast backend API is running!');
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the CodeCast API!' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/video'));
app.use('/api/comments', require('./routes/comment'));
app.use('/api/reactions', require('./routes/reaction'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/watchparty', require('./routes/watchparty'));
app.use('/api/history', require('./routes/history'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/playlists', require('./routes/playlist'));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB and start server
connectMongo().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Place this after all routes:
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
}); 
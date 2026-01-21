import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerMapData,
  GPSPosition,
  LinhCan,
} from '@urban-xianxia/shared';
import { PlayerController } from './controllers/player.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { CharacterModel } from './models/Character.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/player', PlayerController.create); // Legacy Guest
app.get('/api/player/:id', PlayerController.get);
app.patch('/api/player/:id/progress', PlayerController.updateProgress);

// Auth Routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);

// Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-xianxia')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// In-memory player state (synced with Redis)
const activePlayers = new Map<string, PlayerMapData>();

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  let playerId: string | null = null;

  socket.on('player:register', async (data) => {
    try {
      playerId = data.characterId;

      // Fetch real character data from DB
      const character = await CharacterModel.findById(playerId);

      if (!character) {
        console.error(`Character not found for ID: ${playerId}`);
        return;
      }

      // Store player in Redis/Memory
      const playerData: PlayerMapData = {
        id: playerId,
        name: character.name,
        lat: data.position.lat,
        lng: data.position.lng,
        linhCan: character.linhCan as LinhCan,
        level: character.level as any,
        // Default mock status if not provided yet
        status: 'idle' as any,
        speed: 0
      };

      activePlayers.set(playerId, playerData);
      await redisClient.set(`player:${playerId}`, JSON.stringify(playerData));

      // Broadcast join
      socket.broadcast.emit('player:joined', playerData);

      // Send existing players to new player
      const players = Array.from(activePlayers.values());
      socket.emit('player:nearby', players);
    } catch (err) {
      console.error('Socket register error:', err);
    }
  });

  socket.on('player:move', async (position: GPSPosition) => {
    if (!playerId) return;

    const player = activePlayers.get(playerId);
    if (player) {
      player.lat = position.lat;
      player.lng = position.lng;
      // Note: Speed/Status should be sent from Client in 'player:move' payload optimally, 
      // or calculated here. For now, client sends raw position. 
      // We will trust client for now or add speed to GPSPosition DTO later.

      // Update in Redis
      await redisClient.set(`player:${playerId}`, JSON.stringify(player));

      // Broadcast movement (throttle this in production!)
      socket.broadcast.emit('player:moved', player);

      // Check for nearby herbs/events (Rule-based Logic placeholder)
      checkForEvents(playerId, position, socket);
    }
  });

  socket.on('player:disconnect', () => {
    handleDisconnect();
  });

  socket.on('disconnect', () => {
    handleDisconnect();
  });

  async function handleDisconnect() {
    if (playerId) {
      console.log('Player disconnected:', playerId);
      
      // Persist data to MongoDB on disconnect
      const playerData = activePlayers.get(playerId);
      if (playerData) {
          try {
              await CharacterModel.findByIdAndUpdate(playerId, {
                  'lastPosition.lat': playerData.lat,
                  'lastPosition.lng': playerData.lng,
                  lastOnline: Date.now()
              });
          } catch (e) {
              console.error("Failed to save player state:", e);
          }
      }

      activePlayers.delete(playerId);
      redisClient.del(`player:${playerId}`);
      io.emit('player:left', playerId);
      playerId = null;
    }
  }
});

// Rule-based Event Logic (The "Lão Tổ" System)
function checkForEvents(playerId: string, pos: GPSPosition, socket: any) {
  // Simple example: 1% chance to find something when moving
  if (Math.random() < 0.01) {
    socket.emit('laoTo:message', 'Ta cảm nhận được linh khí bất thường quanh đây!');
  }
}

// Start Server
async function start() {
  await redisClient.connect();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

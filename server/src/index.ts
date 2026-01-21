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
  PlayerStatus
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

app.use(cors());
app.use(express.json());

app.post('/api/player', PlayerController.create);
app.get('/api/player/:id', PlayerController.get);
app.patch('/api/player/:id/progress', PlayerController.updateProgress);
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-xianxia')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// State
const activePlayers = new Map<string, PlayerMapData>();
const charSocketMap = new Map<string, string>(); // CharID -> SocketID

io.on('connection', (socket) => {
  let playerId: string | null = null;

  socket.on('player:register', async (data) => {
    try {
      playerId = data.characterId;
      charSocketMap.set(playerId, socket.id);

      const character = await CharacterModel.findById(playerId);
      if (!character) return;

      const playerData: PlayerMapData = {
        id: playerId,
        name: character.name,
        lat: data.position.lat,
        lng: data.position.lng,
        linhCan: character.linhCan as LinhCan,
        level: character.level as any,
        status: PlayerStatus.IDLE,
        speed: 0,
        avatar: character.avatar
      };

      activePlayers.set(playerId, playerData);
      await redisClient.set(`player:${playerId}`, JSON.stringify(playerData));

      socket.broadcast.emit('player:joined', playerData);
      socket.emit('player:nearby', Array.from(activePlayers.values()));
    } catch (err) {
      console.error('Socket register error:', err);
    }
  });

  socket.on('player:move', async (position) => {
    if (!playerId) return;
    const player = activePlayers.get(playerId);
    if (player) {
      player.lat = position.lat;
      player.lng = position.lng;
      player.status = PlayerStatus.WALKING;
      
      await redisClient.set(`player:${playerId}`, JSON.stringify(player));
      socket.broadcast.emit('player:moved', player);
    }
  });

  socket.on('player:meditate', async (isMeditating) => {
    if (!playerId) return;
    const player = activePlayers.get(playerId);
    if (player) {
        player.status = isMeditating ? PlayerStatus.MEDITATING : PlayerStatus.IDLE;
        await redisClient.set(`player:${playerId}`, JSON.stringify(player));
        socket.broadcast.emit('player:moved', player); // Reuse moved event to update status
    }
  });

  socket.on('disconnect', async () => {
    if (playerId) {
      const playerData = activePlayers.get(playerId);
      if (playerData) {
          try {
              await CharacterModel.findByIdAndUpdate(playerId, {
                  'lastPosition.lat': playerData.lat,
                  'lastPosition.lng': playerData.lng,
                  lastOnline: Date.now()
              });
          } catch (e) { console.error(e); }
      }
      activePlayers.delete(playerId);
      charSocketMap.delete(playerId);
      redisClient.del(`player:${playerId}`);
      io.emit('player:left', playerId);
    }
  });
});

// Game Loop (1s Tick)
setInterval(() => {
    activePlayers.forEach((player) => {
        if (player.status === PlayerStatus.MEDITATING) {
            // Broadcast XP gain to everyone (so others can see floating text)
            io.emit('player:exp_gained', { id: player.id, amount: 1 });
        }
    });
}, 1000);

async function start() {
  await redisClient.connect();
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
start();

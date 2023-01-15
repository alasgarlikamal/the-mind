import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis  from 'ioredis';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { v4 } from 'uuid';
import { RoomDto } from './dto/room.dto';
import { Game, Player, Room } from './types';


@Injectable()
export class SocketsService {

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly authService: AuthService){}
  
  async createRoom(socket: Socket) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);

    const roomId = v4();
    
    const player : Player = {
      socketId: socket.id,
      username: user.username,
      image: user.avatar.imageUrl,
      roomId: roomId,
      currentCards: [],
      done: false,
      points: 0,
      isReady: true,
      isAdmin: true
    }
    const room : Room = {
      id: roomId,
      admin: player,
      joinedPlayers: [player],
      readyPlayers: [player],
      kickedPlayers: []
    }
    
    await this.setRoom(room);
    await this.setPlayer(player);
    socket.join(roomId);
  }

  async joinRoom(socket: Socket, roomDto: RoomDto) {
    const room = await this.getRoom(roomDto.roomId);

    const user = await this.authService.extractUser(socket.handshake.auth.token);

    if (!room) return {status: false, message: 'Room not found'};

    if (room.kickedPlayers.find(p => p.username === user.username)) return {status: false, message: 'You have been kicked from this room'};

    if (room.joinedPlayers.length === 4) return {status: false, message: 'Room is full'};


    const player : Player = {
      socketId: socket.id,
      username: user.username,
      image: user.avatar.imageUrl,
      roomId: room.id,
      currentCards: [],
      done: false,
      points: 0,
      isReady: false,
      isAdmin: false

    }

    room.joinedPlayers.push(player);

    await this.setRoom(room);
    await this.setPlayer(player);
    socket.join(room.id);
    return {status: true, message: 'Joined room successfully'};
  }

  async ready(socket: Socket, roomDto: RoomDto) {
    const room = await this.getRoom(roomDto.roomId);

    const user = await this.authService.extractUser(socket.handshake.auth.token);

    const player = await this.getPlayer(user.username);

    player.isReady = true;

    room.readyPlayers.push(player);
    const index = room.joinedPlayers.findIndex(p => p.username === player.username);
    room.joinedPlayers[index].isReady = true;
    await this.setPlayer(player);
    await this.setRoom(room);
  }

  async unready(socket: Socket, roomDto: RoomDto) {
    const room = await this.getRoom(roomDto.roomId);

    const user = await this.authService.extractUser(socket.handshake.auth.token);

    const player = await this.getPlayer(user.username);

    player.isReady = false;

    const index = room.readyPlayers.findIndex(p => p.username === player.username);
    room.readyPlayers.splice(index, 1);
    const index2 = room.joinedPlayers.findIndex(p => p.username === player.username);
    room.joinedPlayers[index2].isReady = false;
    await this.setPlayer(player);
    await this.setRoom(room);
  }

  async getRoom (roomId: string): Promise<Room> {
    const room = await this.redis.get(`room:${roomId}`);

    if (!room) return null;

    return JSON.parse(room);
  }

  async setRoom (room: Room) {
    try {
      await this.redis.setex(`room:${room.id}`, 600, JSON.stringify(room));
      
    } catch (error) {
      throw new Error('Error saving the room');
    }
  }

  async setGame (room: Room) {
    try {

      //array of numbers from 1 to 100
      const deck = Array.from(Array(100).keys()).map(n => n + 1);

     //selecet random numbers from the array and remove them
      const chosenCards = [];

      for (let i = 0; i < room.joinedPlayers.length; i++) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        chosenCards.push(deck[randomIndex]);
        deck.splice(randomIndex, 1);
      }

      const gameLevelCount = room.joinedPlayers.length === 2 ? 12 : room.joinedPlayers.length === 3 ? 10 : 8;

      const game : Game = {
        id: room.id,
        players: [],
        levelCount: gameLevelCount,
        currentLevel: 1,
        lives: room.joinedPlayers.length,
        throwingStarCount: 0,
        throwingStarVote: 0,
        smallestCard: Math.min(...chosenCards)
      }

      await Promise.all(room.joinedPlayers.map(async (player, index) => {
        const currentPlayer = await this.getPlayer(player.username);
        currentPlayer.currentCards = [chosenCards[index]];
        game.players.push(currentPlayer);
        await this.setPlayer(currentPlayer);
      }));
      
      await this.redis.setex(`game:${game.id}`, 600, JSON.stringify(game));
      
    } catch (error) {
      throw new Error('Error saving the game');
    }
  }

  async getGame (gameId: string): Promise<Game> {
    const game = await this.redis.get(`game:${gameId}`);

    if (!game) return null;

    return JSON.parse(game);
  }

  async getPlayer (playerUsername: string): Promise<Player> {

    const player = await this.redis.get(`player:${playerUsername}`);

    if (!player) return null;

    return JSON.parse(player);
  }

  async setPlayer (player: Player) {
    try {
      await this.redis.setex(`player:${player.username}`, 600, JSON.stringify(player));
      
    } catch (error) {
      throw new Error('Error saving the player');
    }
  }



  async getRoomByPlayerUsername (playerUsername: string): Promise<Room> {

    const player = await this.getPlayer(playerUsername);

    if (!player) return null;

    const room = await this.getRoom(player.roomId);
    return room;
  }

  async checkForReconnection (socket: Socket) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);

    if (player) {
      const room = await this.getRoom(player.roomId);
      player.socketId = socket.id;
      await this.setPlayer(player);
      return {roomId: room?.id};
    }

    return null;
  }

  async leaveRoom (socket: Socket, roomDto: RoomDto) {

    const room = await this.getRoom(roomDto.roomId);

    const user = await this.authService.extractUser(socket.handshake.auth.token);

    const player = await this.getPlayer(user.username);

    if (player) {
      room.joinedPlayers = room.joinedPlayers.filter(p => p.username !== player.username);
      room.readyPlayers = room.readyPlayers.filter(p => p.username !== player.username);
      await this.redis.del(`player:${player.username}`);

      if (player.isAdmin && room.joinedPlayers.length > 0){
        room.joinedPlayers[0].isAdmin = true;
        room.joinedPlayers[0].isReady = true;
        room.admin = room.joinedPlayers[0];
        const newAdmin = await this.getPlayer(room.admin.username);
        newAdmin.isAdmin = true;
        newAdmin.isReady = true;
        if(!room.readyPlayers.find(p => p.username === newAdmin.username)) room.readyPlayers.push(newAdmin);

        await this.setPlayer(newAdmin);
      }

      if (room.joinedPlayers.length === 0) await this.redis.del(`room:${room.id}`);
      else await this.setRoom(room);
      
    }

    socket.leave(room.id);
  }

  async removePlayer (socket:Socket, playerUsername: string) {

    const adminUser = await this.authService.extractUser(socket.handshake.auth.token);
    const adminPlayer = await this.getPlayer(adminUser.username);

    if (adminPlayer.isAdmin) {
      const player = await this.getPlayer(playerUsername);
      const room = await this.getRoom(player.roomId);
      room.joinedPlayers = room.joinedPlayers.filter(p => p.username !== player.username);
      room.readyPlayers = room.readyPlayers.filter(p => p.username !== player.username);
      room.kickedPlayers.push(player);
      await this.setRoom(room);
      await this.redis.del(`player:${player.username}`);
      return {room, player};
    }
  }

  async handlePlayerDisconnection(socket: Socket) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);
    if(!user) return null;
    const player = await this.getPlayer(user.username);

    if (player) {
      const room = await this.getRoom(player.roomId);
      room.joinedPlayers = room.joinedPlayers.filter(p => p.username !== player.username);
      room.readyPlayers = room.readyPlayers.filter(p => p.username !== player.username);
      await this.setRoom(room);
      await this.redis.del(`player:${player.username}`);
      return {room, player};
    }

    return null;
  }

  async startGame (socket: Socket, roomDto: RoomDto) {
      
      const room = await this.getRoom(roomDto.roomId);
  
      const user = await this.authService.extractUser(socket.handshake.auth.token);
  
      const player = await this.getPlayer(user.username);
  
      if (player.isAdmin) {
        if (room.joinedPlayers.length != room.readyPlayers.length) return {status: false, message: 'Not all players are ready'};
        if (room.joinedPlayers.length === 1) return {status: false, message: 'Not enough players'};

        await this.setGame(room);
        // await this.redis.del(`room:${room.id}`);
        return {status: true, message: 'Game started'};

      }
    }

}

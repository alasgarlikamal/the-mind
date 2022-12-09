import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, NotFoundException } from '@nestjs/common';
import Redis  from 'ioredis';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { RoomDto } from './dto/room.dto';
import { Room } from './types';

@Injectable()
export class SocketsService {

  constructor(@InjectRedis() private readonly redis: Redis){}
  
  async createRoom(socket: Socket) {
    const room : Room = {
      id: v4(),
      admin: socket.id,
      joinedPlayers: [socket.id],
      readyPlayers: []
    }

    await this.setRoom(room);
  }

  async joinRoom(socket: Socket, roomDto: RoomDto) {
    const room = await this.getRoom(roomDto.roomId);

    room.joinedPlayers.push(socket.id);

    await this.setRoom(room);
  }

  async playerReady(socket: Socket, roomDto: RoomDto) {
    const room = await this.getRoom(roomDto.roomId);

    room.readyPlayers.push(socket.id);

    await this.setRoom(room);
  }

  async getRoom (roomId: string): Promise<Room> {
    const room = await this.redis.get(`room:${roomId}`);

    if (!room) throw new NotFoundException('Room not found');

    return JSON.parse(room);
  }

  async setRoom (room: Room) {
    try {
      await this.redis.setex(`room:${room.id}`, 600, JSON.stringify(room));
      
    } catch (error) {
      throw new Error('Error saving the room');
    }
  }
}

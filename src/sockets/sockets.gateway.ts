import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayDisconnect, OnGatewayConnection, ConnectedSocket } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { ForbiddenException, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ cors: {origin: '*'}})
export class SocketsGateway implements OnGatewayDisconnect, OnGatewayConnection{
  constructor(
    private readonly socketsService: SocketsService,
    private authService: AuthService) {}

  async handleConnection(socket: Socket, ...args: any[]) {
    const auth = socket.handshake.headers.authorization;
    if(!await this.authService.validateWs(auth)){
      socket.disconnect();
      return;
    } 
    console.log(`Server: Connected to id: ${socket.id}`, auth);
  }
  handleDisconnect(socket: Socket) {
    console.log(`${socket.id} disconnected`);
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createRoom')
  async create(@ConnectedSocket() socket: Socket) {
    return await this.socketsService.createRoom(socket);
  }

}
 
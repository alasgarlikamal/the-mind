import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
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

  @SubscribeMessage('createSocket')
  create(@MessageBody() createSocketDto: CreateSocketDto) {
    return this.socketsService.create(createSocketDto);
  }

  @SubscribeMessage('findAllSockets')
  findAll() {
    return this.socketsService.findAll();
  }

  @SubscribeMessage('findOneSocket')
  findOne(@MessageBody() id: number) {
    return this.socketsService.findOne(id);
  }

  @SubscribeMessage('updateSocket')
  update(@MessageBody() updateSocketDto: UpdateSocketDto) {
    return this.socketsService.update(updateSocketDto.id, updateSocketDto);
  }

  @SubscribeMessage('removeSocket')
  remove(@MessageBody() id: number) {
    return this.socketsService.remove(id);
  }
}
 
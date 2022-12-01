import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ cors: {origin: '*'}})
export class SocketsGateway implements OnModuleInit, OnGatewayDisconnect, OnGatewayConnection{
  constructor(
    private readonly socketsService: SocketsService,
    private authService: AuthService) {}

  async handleConnection(socket: Socket, ...args: any[]) {
    const auth = socket.handshake.headers.authorization;
    this.authService.validateWs(auth);
    // const verify = await this.jwtService.verifyAsync(auth)
    console.log(socket);
    console.log(`Server: Connected to id: ${socket.id}`, auth);
  }
  handleDisconnect(socket: Socket) {
    console.log(`${socket.id} disconnected`);
  }

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    
  }

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

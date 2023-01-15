import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayDisconnect, OnGatewayConnection, ConnectedSocket } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { RoomDto } from './dto/room.dto';

@WebSocketGateway({ cors: {origin: '*'}})
export class SocketsGateway implements OnGatewayDisconnect, OnGatewayConnection{
  constructor(
    private readonly socketsService: SocketsService,
    private authService: AuthService) {}

  async handleConnection(socket: Socket, ...args: any[]) {
    const auth = socket.handshake.auth.token;
    if(!await this.authService.validateWs(auth)){
      socket.disconnect();
      return;
    } 

    const reconnection = await this.socketsService.checkForReconnection(socket);
    console.log(reconnection);

    if(reconnection){
      socket.join(reconnection.roomId);
      socket.to(reconnection.roomId).emit('reconnected');
      this.server.to(socket.id).emit('reconnected');
    }

    console.log(`Server: Connected to id: ${socket.id}`);
  }
  async handleDisconnect(socket: Socket) {
    console.log(`${socket.id} disconnected`);
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createRoom')
  async create(@ConnectedSocket() socket: Socket) {
    return await this.socketsService.createRoom(socket);
  }

  @SubscribeMessage('joinRoom')
  async join(@ConnectedSocket() socket: Socket, @MessageBody() roomDto: RoomDto) {
    const joinRoom = await this.socketsService.joinRoom(socket, roomDto);

    if(!joinRoom.status) return this.server.to(socket.id).emit('roomNotFound', {message: joinRoom.message});

    this.server.to(socket.id).emit('roomFound')

    return this.server.to(roomDto.roomId).emit('playerJoined');
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomDto: RoomDto) {
    await this.socketsService.leaveRoom(socket, roomDto);
    return this.server.to(roomDto.roomId).emit('playerLeft');
  }

  @SubscribeMessage('removePlayer')
  async removePlayer(@ConnectedSocket() socket: Socket, @MessageBody() body: any) {
    const data = await this.socketsService.removePlayer(socket, body.playerUsername);
    const sockets = await this.server.in(data.room.id).fetchSockets();
    const kickedSocket = sockets.find(s => s.id === data.player.socketId);
    kickedSocket.leave(data.room.id)
    this.server.to(kickedSocket.id).emit('kicked');
    return this.server.to(data.room.id).emit('playerLeft');
  }

  @SubscribeMessage('playerReady')
  async ready(@ConnectedSocket() socket: Socket, @MessageBody() roomDto: RoomDto) {
    await this.socketsService.ready(socket, roomDto);
    return this.server.to(roomDto.roomId).emit('playerReady');
  }

  @SubscribeMessage('playerUnReady')
  async unReady(@ConnectedSocket() socket: Socket, @MessageBody() roomDto: RoomDto){
    await this.socketsService.unready(socket, roomDto);
    return this.server.to(roomDto.roomId).emit('playerUnReady');
  }

  @SubscribeMessage('startGame')
  async startGame(@ConnectedSocket() socket: Socket, @MessageBody() roomDto: RoomDto) {
    const startGame = await this.socketsService.startGame(socket, roomDto);
    if(!startGame.status) return this.server.to(socket.id).emit('gameNotStarted', {message: startGame.message});
    return this.server.to(roomDto.roomId).emit('gameStarted');
  }
}
 
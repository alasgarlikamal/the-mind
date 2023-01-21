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

    const lobbyReconnection = await this.socketsService.checkForLobbyReconnection(socket);

    if(lobbyReconnection){
      socket.join(lobbyReconnection.roomId);
      this.server.to(lobbyReconnection.roomId).emit('lobbyReconnect');
    }

    const gameReconnection = await this.socketsService.checkForGameReconnection(socket);

    if(gameReconnection){
      socket.join(gameReconnection.gameId);
      this.server.to(gameReconnection.gameId).emit('gameReconnect');
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

  @SubscribeMessage('getCards')
  async getCards(@ConnectedSocket() socket: Socket) {
    const cards = await this.socketsService.getCards(socket);
    return this.server.to(socket.id).emit('cards', cards);
  }

  @SubscribeMessage('getGameData')
  async getGameData(@ConnectedSocket() socket: Socket) {

    const gameData = await this.socketsService.getGameData(socket);
    return this.server.to(socket.id).emit('gameData', gameData);
  }


  @SubscribeMessage('playCard')
  async playCard(@ConnectedSocket() socket: Socket, @MessageBody() body: any) {
    console.log(body, 'here')
    const playCard = await this.socketsService.playCard(socket, body.card);
    console.log(playCard, 'here')

    if (playCard.reason){
      return this.server.to(playCard.roomId).emit(playCard.reason, { message: playCard.message, status: playCard.status});
    }

  }

  @SubscribeMessage('voteKickPlayerStart')
  async voteKickPlayer(@ConnectedSocket() socket: Socket, @MessageBody() body: any) {

    const voteKickPlayer = await this.socketsService.handleVoteKickStart(socket, body.username);

    const roomId = voteKickPlayer.roomId;

    return this.server.to(roomId).emit('voteKickPlayerStarted', voteKickPlayer);
  }

  @SubscribeMessage('voteKickPlayer')
  async voteKickPlayerVote(@ConnectedSocket() socket: Socket, @MessageBody() body: any) {
    const voteKickPlayer = await this.socketsService.handleVoteKick(socket, body);

    const roomId = voteKickPlayer.roomId;

    if (voteKickPlayer.status){
      const sockets = await this.server.in(roomId).fetchSockets();
      const kickedSocket = sockets.find(s => s.id === voteKickPlayer.kickedPlayer.socketId);
      kickedSocket.leave(roomId)
      this.server.to(kickedSocket.id).emit('kicked');
      return this.server.to(roomId).emit('playerKicked', {message: voteKickPlayer.message, status: voteKickPlayer.status});
    }else{
      return this.server.to(roomId).emit('voteCounted', voteKickPlayer);
    }

  }

  @SubscribeMessage('throwingStarVoteStart')
  async throwingStarVoteStart(@ConnectedSocket() socket: Socket) {
    console.log('vote started')
    const throwingStarVote = await this.socketsService.handleThrowingstarVoteStart(socket);

    if (throwingStarVote.status){
      return this.server.to(throwingStarVote.roomId).emit('throwingStarVoteStarted', throwingStarVote);
    }
  }

  @SubscribeMessage('throwingStarVote')
  async throwingStarVote(@ConnectedSocket() socket: Socket, @MessageBody() body: any) {
    const throwingStarVote = await this.socketsService.handleThrowingstarVote(socket, body.vote);

    if (!throwingStarVote.status){
      return this.server.to(throwingStarVote.roomId).emit('throwingStarVoteCounted', throwingStarVote.data);
    }else{
      return this.server.to(throwingStarVote.roomId).emit(throwingStarVote.reason, {message: throwingStarVote.message, status: throwingStarVote.status});
    }
  }

  @SubscribeMessage('leaveGame')
  async leaveGame(@ConnectedSocket() socket: Socket) {
    const leaveGame = await this.socketsService.leaveGame(socket);
    if (!leaveGame.status){
      socket.leave(leaveGame.roomId);
      return this.server.to(leaveGame.roomId).emit('playerLeft', {message: leaveGame.message, status: leaveGame.status});
    }

    if (leaveGame.status){
      return this.server.to(leaveGame.roomId).emit('gameOver', {message: leaveGame.message, status: leaveGame.status});
    }
  }

}
 
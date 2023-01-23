import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis  from 'ioredis';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { v4 } from 'uuid';
import { RoomDto } from './dto/room.dto';
import { Game, Player, Room, ThrowingstarVote, VoteKick } from './types';


@Injectable()
export class SocketsService {

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly authService: AuthService,
    private readonly usersService: UsersService){}
  
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
      await this.redis.setex(`room:${room.id}`, 7200, JSON.stringify(room));
      
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
        throwingStarCount: 1,
        throwingStarVote: 0,
        smallestCard: 0
      }

      await Promise.all(room.joinedPlayers.map(async (player, index) => {
        const currentPlayer = await this.getPlayer(player.username);
        currentPlayer.currentCards = [chosenCards[index]];
        game.players.push(currentPlayer);
        await this.setPlayer(currentPlayer);
      }));
      
      await this.redis.setex(`game:${game.id}`, 7200, JSON.stringify(game));
      
    } catch (error) {
      throw new Error('Error saving the game');
    }
  }

  async updateGame (game: Game) {
    try {
      await this.redis.setex(`game:${game.id}`, 7200, JSON.stringify(game));

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
      await this.redis.setex(`player:${player.username}`, 7200, JSON.stringify(player));
      
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

  async checkForLobbyReconnection (socket: Socket) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);

    if (!user) return null;
    const player = await this.getPlayer(user.username);

    if (player) {
      const room = await this.getRoom(player.roomId);

      if (!room) return null;
      const index = room.joinedPlayers.findIndex(p => p.username === player.username);
      room.joinedPlayers[index].socketId = socket.id;
      await this.setRoom(room);
      player.socketId = socket.id;
      await this.setPlayer(player);
      return {roomId: room?.id};
    }

    return null;
  }

  async checkForGameReconnection (socket: Socket) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);

    if (!user) return null;

    const player = await this.getPlayer(user.username);

    if (player) {
      const game = await this.getGame(player.roomId);
      if (!game) return null;
      const index = game.players.findIndex(p => p.username === player.username);
      game.players[index].socketId = socket.id;
      await this.updateGame(game);
      player.socketId = socket.id;
      await this.setPlayer(player);
      return {gameId: game?.id};
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

  //remove player from lobby
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
        await this.redis.del(`room:${room.id}`);
        return {status: true, message: 'Game started'};

      }
    }

  async getCards(socket: Socket) {
    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);

    if (player) return player.currentCards;
  }

  async getGameData(socket: Socket) {
    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);

    if (!player) return null;

    const game = await this.getGame(player.roomId);

    if (!game) return null;

    const playerInfo = [];

    game.players.forEach(p => {
      if (p.username !== player.username){
        playerInfo.push({
          username: p.username,
          image: p.image,
          cardCount: p.currentCards.length,
        })
      }
    })

    const gameData = {
      playerCount: game.players.length,
      lives: game.lives,
      throwingStars: game.throwingStarCount,
      playerInfo,
      smallestCard: game.smallestCard,
      level: game.currentLevel
    }


    return gameData;
  }

  async playCard(socket: Socket, card: number) {
    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);
    if (player.currentCards.find(c => c < card)){
      return {status: false, message: 'That card is not your smallest card'};
    }

    const game = await this.getGame(player.roomId);

    player.currentCards = player.currentCards.filter(c => c !== card);

    if (player.currentCards.length === 0) {
      player.done = true;
    }

    const index = game.players.findIndex(p => p.username === player.username);
    game.players[index] = player;

    game.smallestCard = card;

    var wrongCardFlag = false;

    game.players.forEach(p => {
      p.currentCards.forEach(cards => {
        if (cards < card){
          wrongCardFlag = true;
          p.currentCards = p.currentCards.filter(c => c !== cards);
        }
      })
      if (p.currentCards.length === 0) p.done = true;
  })

    console.log(wrongCardFlag, 'cardflag')

    const everyPlayerDone = this.checkEveryPlayerDone(game);

    console.log(everyPlayerDone, 'everyPlayerDone')

    if (!wrongCardFlag && !everyPlayerDone){
      //increase points by 10
      game.players[index].points += 10;
      await this.savePlayers(game);
      await this.updateGame(game);
      return {status: true, reason: 'correctCard' ,message: `${player.username} played ${card}`, roomId: player.roomId};
    }

    if (wrongCardFlag){
      game.players[index].points -= 10;
      game.lives--;
    } 

    if (game.lives === 0){
      await this.savePlayers(game);
      await this.updateGame(game);
      await this.endGame(game);
      return {status: false, reason: 'gameOver', message: 'Game over', roomId: player.roomId};
    }
    if (!everyPlayerDone && wrongCardFlag && game.lives != 0 ){
      await this.savePlayers(game);
      await this.updateGame(game);
      return {status: false, reason:'wrongCard', message: `${player.username} played ${card}: - 1 life`, roomId: player.roomId};
    } 

    if (everyPlayerDone && game.currentLevel === game.levelCount){
      game.players[index].points += 10;
      await this.savePlayers(game);
      await this.updateGame(game);
      await this.endGame(game);
      return {status: true, reason: 'win', message: 'You win', roomId: player.roomId};
    }

    if (everyPlayerDone && game.currentLevel !== game.levelCount){
      game.players[index].points += 10;
      await this.nextLevel(game);
      return {status: true, reason:'nextLevel', message: `Proceeding to level ${game.currentLevel} `, roomId: player.roomId};
    }

  }

  checkEveryPlayerDone(game: Game) {
    var flag = true;
    game.players.forEach(p => {
      if (!p.done) flag = false;
    })
    return flag;
  }

  async nextLevel(game: Game){

    game.currentLevel++;

    if (game.currentLevel % 3 === 0) game.lives++;

    if (game.currentLevel === 2 || game.currentLevel === 5 || game.currentLevel === 8) game.throwingStarCount++;

    game.players.forEach(p => {
      p.done = false;
    })

    game.smallestCard = 0;

    const deck = Array.from(Array(100).keys()).map(n => n + 1);

    game.players.forEach(p => {
      p.currentCards = [];
      for (let i = 0; i < game.currentLevel; i++) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        p.currentCards.push(deck[randomIndex]);
        deck.splice(randomIndex, 1);
      }
    })

    await this.updateGame(game);
    await this.savePlayers(game);
  }

  async endGame(game: Game) {

    await Promise.all(game.players.map(async p => {
      const data = await this.usersService.updatePlayerStats(p, game);
      console.log(data)
    }));

    await Promise.all(game.players.map(async p => {
      await this.redis.expire(`player:${p.username}`, 10);
    }))

    await this.redis.expire(`game:${game.id}`, 10);

  }

  async savePlayers(game: Game) {
    await Promise.all(game.players.map(async p => {
      await this.setPlayer(p);
    }))
  }

  async setVotekick(voteKick: VoteKick){
    try {
      await this.redis.setex(`votekick:${voteKick.kickPlayer}`, 60, JSON.stringify(voteKick));
      
    } catch (error) {
      throw new Error('Error saving votekick');
    }
  }

  async updateVotekick(voteKick: VoteKick){
    try {
      await this.redis.del(`votekick:${voteKick.kickPlayer}`);
      await this.redis.setex(`votekick:${voteKick.kickPlayer}`, 60, JSON.stringify(voteKick));
    } catch (error) {
      throw new Error('Error updating votekick');
    }
  }


  async getVoteKick(username: string): Promise<VoteKick>{
    const votekick = await this.redis.get(`votekick:${username}`);

    if (!votekick) return null;

    return JSON.parse(votekick);
  }

  async setThrowingStarVote(throwingstarVote: ThrowingstarVote){
    try {
      await this.redis.setex(`throwingstarvote:${throwingstarVote.gameId}`, 60, JSON.stringify(throwingstarVote));

    } catch (error) {
      throw new Error('Error saving throwingstarvote');
    }
  }

  async updateThrowingStarVote(throwingstarVote: ThrowingstarVote){
    try {
      await this.redis.del(`throwingstarvote:${throwingstarVote.gameId}`);
      await this.redis.setex(`throwingstarvote:${throwingstarVote.gameId}`, 60, JSON.stringify(throwingstarVote));
    } catch (error) {
      throw new Error('Error updating throwingstarvote');
    }
  }

  async getThrowingStarVote(gameId: string): Promise<ThrowingstarVote>{
    const throwingstarVote = await this.redis.get(`throwingstarvote:${gameId}`);

    if (!throwingstarVote) return null;

    return JSON.parse(throwingstarVote);
  }

  async handleThrowingstarVoteStart(socket: Socket) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);

    const game = await this.getGame(player.roomId);

    if (game.throwingStarCount === 0) return {status: false, message: 'You have no throwing stars', roomId: player.roomId};

    const throwingStarVote: ThrowingstarVote = {
      gameId: game.id,
      yes: 0,
      no: 0,
      startedBy: player.username,
      players: []
    };

    await this.setThrowingStarVote(throwingStarVote);

    return {status:true, ...throwingStarVote, roomId: player.roomId};
  }

  async handleThrowingstarVote(socket: Socket, vote: string) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);
    const game = await this.getGame(player.roomId);

    const throwingStarVote = await this.getThrowingStarVote(game.id);

    if (vote === 'yes') throwingStarVote.yes++;
    if (vote === 'no') throwingStarVote.no++;    

    throwingStarVote.players.push(player.username);

    if (throwingStarVote.players.length > game.players.length/2 && throwingStarVote.yes > throwingStarVote.no) {
      game.throwingStarCount--;

      game.players.forEach(p => {
        const smallestCard = Math.min(...p.currentCards);
        p.currentCards = p.currentCards.filter(c => c !== smallestCard);
      })

      if (game.players.every(p => p.currentCards.length === 0) && game.currentLevel === game.levelCount) {
        await this.updateGame(game);
        await this.savePlayers(game);
        await this.redis.del(`throwingstarvote:${game.id}`)
        await this.endGame(game);
        console.log('win')
        return {status: true, reason: 'win', message: 'You win', roomId: player.roomId};
      }

      if (game.players.every(p => p.currentCards.length === 0) && game.currentLevel !== game.levelCount) {
        await this.nextLevel(game);
        console.log('nextlevel')
        return {status: true, reason:'nextLevel', message: `Proceeding to level ${game.currentLevel} `, roomId: player.roomId};
      }

      await this.savePlayers(game);
      await this.updateGame(game);
      console.log('used')
      return {status: true, reason: 'throwingStarUsed', message: 'Throwing star used',roomId: player.roomId};
    }    
    await this.updateThrowingStarVote(throwingStarVote);

    return {status: false, data: throwingStarVote, roomId: player.roomId};

  }

  async handleVoteKickStart(socket: Socket, username: string) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);

    const playerToBeKicked = await this.getPlayer(username);

    const votekick: VoteKick = {
      yes: 0,
      no: 0,
      startedBy: player.username,
      kickPlayer: playerToBeKicked.username,
      players: [],
    }

    await this.setVotekick(votekick);

    return {...votekick, roomId: player.roomId};

  }

  async handleVoteKick(socket: Socket, body: any) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);
    const game = await this.getGame(player.roomId);

    const playerToBeKicked = await this.getPlayer(body.username);

    const votekick = await this.getVoteKick(playerToBeKicked.username);

    votekick.players.push(player.username);

    if (body.vote === 'yes') votekick.yes++;
    if (body.vote === 'no') votekick.no++;

    if (votekick.players.length >= game.players.length && votekick.yes > votekick.no){
      await this.redis.del(`votekick:${playerToBeKicked.username}`);
      await this.redis.del(`player:${playerToBeKicked.username}`);
      game.players = game.players.filter(p => p.username !== playerToBeKicked.username);
      await this.updateGame(game);
      return {status: true, message: `${playerToBeKicked.username} has been kicked`, kickedPlayer: playerToBeKicked, roomId: player.roomId};
    }

    await this.updateVotekick(votekick);

    return {status:false, ...votekick, roomId: player.roomId};

  }

  async leaveGame(socket: Socket) {

    const user = await this.authService.extractUser(socket.handshake.auth.token);
    const player = await this.getPlayer(user.username);

    const game = await this.getGame(player.roomId);

    const playerIndex = game.players.findIndex(p => p.username === player.username);

    if (playerIndex > -1) game.players.splice(playerIndex, 1);

    if (game.players.length === 1) {

      await this.endGame(game);
      await this.redis.del(`player:${player.username}`)
      return {status: true, message: `${player.username} left the game`, roomId: player.roomId};
    }


    await this.updateGame(game);

    await this.redis.del(`player:${player.username}`);

    return {status: false, message: `${player.username} left the game`, roomId: player.roomId};

  }

}
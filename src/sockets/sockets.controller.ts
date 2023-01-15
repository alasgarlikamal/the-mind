import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth-guard";
import { SocketsGateway } from "./sockets.gateway";
import { SocketsService } from "./sockets.service";

@Controller('game')
export class SocketsController {

    constructor(
        private readonly socketsGateway: SocketsGateway,
        private readonly socketsService: SocketsService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createGame() {
        
        console.log('create game');
    }

    @UseGuards(JwtAuthGuard)
    @Get('player/:playerUsername/room')
    async getRoomByPlayerId(@Param('playerUsername') playerUsername: string) {
        return await this.socketsService.getRoomByPlayerUsername(playerUsername);
    }
}
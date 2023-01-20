import { Module } from '@nestjs/common';
import { SocketsService } from './sockets.service';
import { SocketsGateway } from './sockets.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { SocketsController } from './sockets.controller';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [AuthModule, UsersModule],
  controllers: [SocketsController],
  providers: [SocketsGateway, SocketsService]
})
export class SocketsModule {}

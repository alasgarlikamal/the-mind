import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './entities/avatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar])],
  controllers: [AvatarsController],
  providers: [AvatarsService],
  exports: [AvatarsService]
})
export class AvatarsModule {}

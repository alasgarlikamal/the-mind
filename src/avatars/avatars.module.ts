import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './entities/avatar.entity';
import { About } from 'src/about/entities/about.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar,About])],
  controllers: [AvatarsController],
  providers: [AvatarsService],
  exports: [AvatarsService]
})
export class AvatarsModule {}

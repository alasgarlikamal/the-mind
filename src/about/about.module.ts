import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { About } from './entities/about.entity';

@Module({
  imports: [TypeOrmModule.forFeature([About])],
  providers: [AboutService],
  controllers: [AboutController]
})
export class AboutModule {}

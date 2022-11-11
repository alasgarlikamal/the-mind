import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { Avatar } from './entities/avatar.entity';

@Injectable()
export class AvatarsService {
  constructor(@InjectRepository(Avatar) private repo: Repository<Avatar>) {}

  async findAll() {
    const avatars = await this.repo.find();
    if (avatars.length === 0) throw new NotFoundException('Avatars not found');
    return avatars;
  }

  async findOne(id: number) {
    const avatar = await this.repo.findOneBy({ id });
    if (!avatar) throw new NotFoundException('Avatar not found!');
    return avatar;
  }
}

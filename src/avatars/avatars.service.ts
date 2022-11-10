import { Injectable } from '@nestjs/common';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Injectable()
export class AvatarsService {
  create(createAvatarDto: CreateAvatarDto) {
    return 'This action adds a new avatar';
  }

  findAll() {
    return `This action returns all avatars`;
  }

  findOne(id: number) {
    return `This action returns a #${id} avatar`;
  }

  update(id: number, updateAvatarDto: UpdateAvatarDto) {
    return `This action updates a #${id} avatar`;
  }

  remove(id: number) {
    return `This action removes a #${id} avatar`;
  }
}

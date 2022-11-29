import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarsService } from 'src/avatars/avatars.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly avatarsService: AvatarsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userFound = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });

    const avatar = await this.avatarsService.findOne(createUserDto.avatarId);

    if (userFound)
      throw new MethodNotAllowedException(
        `User with email ${createUserDto.email} is already registered`,
      );

    const user = this.usersRepository.create({
      ...createUserDto,
      username: createUserDto.email,
      avatar,
    });

    if (!user) throw new BadRequestException('User could not be created');

    return await this.usersRepository.save(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user)
      throw new NotFoundException(`User with email ${email} was not found`);

    return user;
  }

  async getUserInfo(user: User) {
    return await this.findOneByEmail(user.email);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async updateUserInfo(user: User, updateUserDto: UpdateUserDto) {
    const userFound = await this.findOneByEmail(user.email);

    Object.assign(userFound, updateUserDto);

    return await this.usersRepository.save(userFound);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

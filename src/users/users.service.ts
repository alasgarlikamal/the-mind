import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarsService } from 'src/avatars/avatars.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { Game, Player } from 'src/sockets/types';

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
    const user = await this.usersRepository.findOne({where: { email }, relations: ['avatar']});

    if (!user)
      throw new NotFoundException(`User with email ${email} was not found`);

    return user;
  }


  async validateUsername(username: string) {
    if(username.length === 0){
      throw new ForbiddenException('Username is empty');
    }
    const user = await this.usersRepository.findOneBy({username});
    if(!user){
      return true;
    }
    return false;
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

    if (updateUserDto.avatarId){
      const avatar = await this.avatarsService.findOne(updateUserDto.avatarId);
      Object.assign(userFound, {avatar});
    }

    Object.assign(userFound, updateUserDto);

    return await this.usersRepository.save(userFound);
  }

  async updateUsername(user: User, updateUsernameDto: UpdateUsernameDto) {
    const userFound = await this.findOneByEmail(user.email);
    
    if(!await this.validateUsername(updateUsernameDto.username)){
      throw new ForbiddenException('Username is already taken');
    }

    Object.assign(userFound, updateUsernameDto);

    return await this.usersRepository.save(userFound);
  }

  async updatePlayerStats(player: Player, game: Game) {
    const userFound = await this.usersRepository.findOne({where: { username: player.username }, relations: ['avatar']});    

    Object.assign(userFound, {
      elo: userFound.elo + player.points, 
      gamesPlayed: userFound.number_of_games_played + 1,
      maxLevelReached: Math.max(userFound.max_level_reached, game.currentLevel), });
    return await this.usersRepository.save(userFound);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

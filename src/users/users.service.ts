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

import { UpdateUsernameDto } from './dto/update-username.dto';
import { Game, Player } from 'src/sockets/types';

import { uniqueNamesGenerator, adjectives, colors, animals, NumberDictionary } from 'unique-names-generator';

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

    const numberDictionary = NumberDictionary.generate({ min: 100, max: 9999 });
    const username = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, numberDictionary],
      length: 3,
      separator: '',
      style: 'capital',
    });
    
    const user = this.usersRepository.create({
      ...createUserDto,
      username,
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
      number_of_games_played: userFound.number_of_games_played + 1,
      max_level_reached: Math.max(userFound.max_level_reached, game.currentLevel), });
    console.log(userFound);
    return await this.usersRepository.save(userFound);
  }
}

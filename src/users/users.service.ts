import { BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}
  
  async create(createUserDto: CreateUserDto) {
    const userFound = await this.usersRepository.findOneBy({ email: createUserDto.email });

    if (userFound) throw new MethodNotAllowedException(`User with email ${createUserDto.email} is already registered`);

    const user = this.usersRepository.create({...createUserDto, username: createUserDto.email});

    if (!user) throw new BadRequestException('User could not be created');

    return await this.usersRepository.save(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) throw new NotFoundException(`User with email ${email} was not found`);

    return user;
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

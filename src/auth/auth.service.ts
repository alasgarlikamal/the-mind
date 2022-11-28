import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { v4 } from 'uuid';
import { ConfirmToken } from './entities/confirmToken.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, 
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(ConfirmToken) private confirmTokenRepository: Repository<ConfirmToken>){}

  async login(loginDto: LoginDto){
    try {
      const user = await this.usersService.findOneByEmail(loginDto.email);
      const isMatch = await bcrypt.compare(loginDto.password, user.password);

      if (!isMatch){
        throw new ForbiddenException('Password is incorrect');
      }

      return {
        access_token: this.jwtService.sign({ email: user.email, sub: user.id})
      }
    } catch (error) {
       throw error;
    }
  }

  async register(createUserDto: CreateUserDto){

    try {
      const user = await this.usersService.create(createUserDto);

      const confirmToken = await this.createConfirmToken(user);

      return await this.mailService.sendEmailConfirmationMail({
        email: user.email,
        firstName: user.firstname,
        token: confirmToken.token,
      })

    } catch (error) {
      throw error;
    }
  }

  async confirmMail(token: string) {
    const confirmationToken = await this.confirmTokenRepository.findOne({
      where: { token },
      relations: {
        user: true
      }
    });
    if (!confirmationToken) throw new NotFoundException('Comfirmation token is not found');

    const userId: number = confirmationToken.user.id;
    const updateResult: UpdateResult = await this.usersRepository.update({ id: userId }, { isActive: true });
    if (!updateResult || updateResult.affected === 0) throw new BadRequestException('Could not confirm user');

    const options = { token, user: confirmationToken.user } as unknown;
    const deleteResult: DeleteResult = await this.confirmTokenRepository.delete(options);
    if (deleteResult && deleteResult.affected === 0) throw new BadRequestException('Could not delete confirmation token.');

    const payload = { email: confirmationToken.user.email, sub: confirmationToken.user.id };

    return this.jwtService.sign(payload);
  }

  async createConfirmToken(user: User){
    const token: string = v4();
    const confirmationToken = this.confirmTokenRepository.create({ token, user });
    if (!confirmationToken) throw new BadRequestException('Could not create a confirmation token');
    return await this.confirmTokenRepository.save(confirmationToken);
  }
}

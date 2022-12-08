import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { v4 } from 'uuid';
import { ConfirmMailToken } from './entities/confirmMailToken.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { ConfirmPasswordToken } from './entities/confirmPasswordToken.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(ConfirmMailToken)
    private confirmMailTokenRepository: Repository<ConfirmMailToken>,
    @InjectRepository(ConfirmPasswordToken)
    private confirmPasswordTokenRepository: Repository<ConfirmPasswordToken>,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findOneByEmail(loginDto.email);
      const isMatch = await bcrypt.compare(loginDto.password, user.password);

      if (!isMatch) {
        throw new ForbiddenException('Password is incorrect');
      }

      return {
        access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
      };
    } catch (error) {
      throw error;
    }
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);

      const confirmToken = await this.createMailConfirmToken(user);

      return await this.mailService.sendEmailConfirmationMail({
        token: confirmToken.token,
        firstName: user.firstname,
        email: user.email,
      });
    } catch (error) {
      throw error;
    }
  }

  async confirmMail(token: string) {
    const confirmationToken = await this.confirmMailTokenRepository.findOne({
      where: { token },
      relations: {
        user: true,
      },
    });
    if (!confirmationToken)
      throw new NotFoundException('Confirmation token is not found');

    const userId: number = confirmationToken.user.id;
    const updateResult: UpdateResult = await this.usersRepository.update(
      { id: userId },
      { isActive: true },
    );
    if (!updateResult || updateResult.affected === 0)
      throw new BadRequestException('Could not confirm user');

    const options = { token, user: confirmationToken.user } as unknown;
    const deleteResult: DeleteResult =
      await this.confirmMailTokenRepository.delete(options);
    if (deleteResult && deleteResult.affected === 0)
      throw new BadRequestException('Could not delete confirmation token.');

    const payload = {
      email: confirmationToken.user.email,
      sub: confirmationToken.user.id,
    };

    return this.jwtService.sign(payload);
  }

  async createMailConfirmToken(user: User) {
    const token: string = v4();
    const confirmationToken = this.confirmMailTokenRepository.create({
      token,
      user,
    });
    if (!confirmationToken)
      throw new BadRequestException('Could not create a confirmation token');
    return await this.confirmMailTokenRepository.save(confirmationToken);
  }

  async createPasswordConfirmToken(user: User, password: string) {
    const token: string = v4();
    const confirmationToken = this.confirmPasswordTokenRepository.create({
      token,
      user,
      password,
    });
    if (!confirmationToken)
      throw new BadRequestException('Could not create a confirmation token');
    return await this.confirmPasswordTokenRepository.save(confirmationToken);
  }

  async resetPassword(user: User, resetPasswordDto: ResetPasswordDto) {
    const userFound = await this.usersService.findOneByEmail(user.email);
    const isMatch = await bcrypt.compare(
      resetPasswordDto.password,
      userFound.password,
    );
    if (isMatch)
      throw new ConflictException("New password can't be same as old password");
    const salt = await bcrypt.genSalt();
    userFound.password = await bcrypt.hash(resetPasswordDto.password, salt);
    const confirmToken = await this.createPasswordConfirmToken(
      user,
      userFound.password,
    );
    return await this.mailService.sendResetPasswordMail({
      email: user.email,
      firstName: user.firstname,
      token: confirmToken.token,
    });
  }
  catch(error) {
    throw error;
  }

  async confirmPassword(token: string) {
    const confirmationToken = await this.confirmPasswordTokenRepository.findOne(
      {
        where: { token },
        relations: {
          user: true,
        },
      },
    );
    if (!confirmationToken)
      throw new NotFoundException('Confirmation token is not found');
    const userFound = await this.usersService.findOneByEmail(
      confirmationToken.user.email,
    );
    await this.confirmPasswordTokenRepository.remove(confirmationToken);
    return await this.usersRepository.update(
      { id: userFound.id },
      { password: confirmationToken.password },
    );
  }
}

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/login')
  create(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('confirm-email/:token')
  async confirmEmail(@Param('token') token: string) {
    try {
      await this.authService.confirmMail(token);
      return 'success!';
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/reset-password')
  resetPassword(
    @GetUser() user: User,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(user, resetPasswordDto);
  }

  @Get('confirm-password/:token')
  async confirmPassword(@Param('token') token: string) {
    try {
      await this.authService.confirmPassword(token);
      return 'Reset Password success!';
    } catch (error) {
      throw error;
    }
  }
}

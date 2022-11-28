import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  create(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() createUserDto: CreateUserDto){
    return this.authService.register(createUserDto);
  }

  @Get('confirm-email/:token')
  async confirmEmail(@Param('token') token: string){
    try {
      await this.authService.confirmMail(token);
      return "success!";
      
    } catch (error) {
      throw error;
    }
  }


}

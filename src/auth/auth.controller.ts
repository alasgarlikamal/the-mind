import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth-guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  
  @Post('/login')
  @ApiOkResponse({ 
    status: 201, 
    description: 'The user has been successfully logged in.'
  })
  @ApiBadRequestResponse({
    status: 404,
    description: 'Failed to log in. Try again!'
})
  @ApiBody({ type: [LoginDto] })
  create(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
  
  @Post('/register')
  @ApiOkResponse({ 
    status: 201, 
    description: 'The user has been successfully registered.'
  })
  @ApiCreatedResponse({
    description: 'Registered user',
    type: User,
  })
  @ApiBadRequestResponse({ 
    status: 404,
    description: 'User can not register. Try again!' 
  })
  @ApiBody({ type: [CreateUserDto] })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  

  @Get('confirm-email/:token')
  @ApiOkResponse({ 
    status: 201, 
    description: 'The email address has been comfirmed.'
  })
  @ApiBadRequestResponse({ 
    status: 404,
    description: 'Failed to confirm the email address' 
  })
  @ApiParam({name: 'token'})
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
  @ApiOkResponse({ 
    status: 201, 
    description: 'The email address has been reset.'
  })
  @ApiBadRequestResponse({ 
    status: 404,
    description: 'Failed to reset the email address' 
  })
  @ApiBody({ type: [ResetPasswordDto] })
  resetPassword(
    @GetUser() user: User,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(user, resetPasswordDto);
  }

  
  @Get('confirm-password/:token')
  @ApiOkResponse({ 
    status: 201, 
    description: 'The email address has been changed.'
  })
  @ApiBadRequestResponse({ 
    status: 404,
    description: 'Failed to change the email address' 
  })
  @ApiParam({name: 'token'})
  async confirmPassword(@Param('token') token: string) {
    try {
      await this.authService.confirmPassword(token);
      return 'Reset Password success!';
    } catch (error) {
      throw error;
    }
  }
}

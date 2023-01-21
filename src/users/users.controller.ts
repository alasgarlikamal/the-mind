import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateUsernameDto } from './dto/update-username.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiOkResponse({
    status: 201,
    description: 'Successfully returned user information'
  })
  @ApiBadRequestResponse({
    status: 404,
    description: 'Failed to return user information'
  })
  getUserInfo(@GetUser() user: User) {
    return this.usersService.getUserInfo(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-user')
  @ApiBody({ type: [UpdateUserDto] })
  @ApiOkResponse({
    status: 201,
    description: 'User information has been successfully updated.'
  })
  @ApiBadRequestResponse({
    status: 404,
    description: 'Failed to update user information'
  })
  updateUserInfo(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserInfo(user, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate/:username')
  async validateUsername(@Param('username') username: string) {
    return await this.usersService.validateUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('username')
  async updateUsername(@GetUser() user: User, @Body() updateUsernameDto: UpdateUsernameDto) {
    return await this.usersService.updateUsername(user, updateUsernameDto);
  }
}

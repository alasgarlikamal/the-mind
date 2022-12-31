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


  @Get()
  @ApiOkResponse({
    status: 201,
    description: 'Successfully returned all users'
  })
  @ApiBadRequestResponse({
    status: 404,
    description: 'Users were not found.'
  })
  findAll() {
    return this.usersService.findAll();
  }


  @Get(':id')
  @ApiParam({name: 'id'})
  @ApiOkResponse({
    status: 201,
    description: 'Successfully returned the user.'
  })
  @ApiBadRequestResponse({
    status: 404,
    description: 'User was not found.'
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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


  @Delete(':id')
  @ApiParam({name: 'id'})
  @ApiOkResponse({
    status: 201,
    description: 'User has been successfully deleted.'
  })
  @ApiBadRequestResponse({
    status: 404,
    description: 'Failed to delete the user.'
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
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

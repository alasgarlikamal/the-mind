import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AvatarsService } from './avatars.service';

@ApiTags('Avatars')
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get()
  @ApiOkResponse({ 
    status: 201, 
    description: 'Successfully returned all avatars.'
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Avatars were not found'
  })
  findAll() {
    return this.avatarsService.findAll();
  }


  @Get(':id')
  @ApiParam({name: 'id'})
  @ApiOkResponse({
    status: 201,
    description: 'Successfully returned the avatar.'
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Avatar was not found.'
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.avatarsService.findOne(id);
  }

  @Post('seed')
  @ApiOkResponse({ 
    status: 201, 
    description: 'Successfully seeded all avatars.'
  })
  async seedAvatars(){
    return await this.avatarsService.seedAvatars();
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AvatarsService } from './avatars.service';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get()
  findAll() {
    return this.avatarsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.avatarsService.findOne(id);
  }
}

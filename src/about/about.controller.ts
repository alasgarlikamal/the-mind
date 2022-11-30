import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';

@ApiTags('About')
@Controller('about')
export class AboutController {
    constructor(private readonly aboutService: AboutService) {}

    @Get()
    findAll(){
        return this.aboutService.findAll();
    }

    @Post()
    create(@Body() createAboutDto: CreateAboutDto){
        return this.aboutService.create(createAboutDto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateAboutDto: UpdateAboutDto){
        return this.aboutService.update(id, updateAboutDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number){
        return this.aboutService.remove(id);
    }
    
}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { About } from './entities/about.entity';

@ApiTags('About')
@Controller('about')
export class AboutController {
    constructor(private readonly aboutService: AboutService) { }

    @Get()
    @ApiOkResponse({
        status: 201,
        description: 'Successfully returned all developers.'
    })
    @ApiNotFoundResponse({
        status: 404,
        description: 'Developers were not found'
    })
    findAll() {
        return this.aboutService.findAll();
    }

    @Post()
    @ApiOkResponse({
        status: 201,
        description: 'The record has been successfully created.'
    })
    @ApiCreatedResponse({
        description: 'Created record',
        type: About,
    })
    @ApiBadRequestResponse({
        status: 404,
        description: 'Failed creating a new record.'
    })
    @ApiBody({ type: [CreateAboutDto] })
    create(@Body() createAboutDto: CreateAboutDto) {
        return this.aboutService.create(createAboutDto);
    }

    @Patch(':id')
    @ApiOkResponse({
        status: 201,
        description: 'The record has been successfully updated.'
    })
    @ApiBadRequestResponse({
        status: 404,
        description: 'Failed updating the record.'
    })
    @ApiBody({ type: [UpdateAboutDto] })
    @ApiParam({ name: 'id' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateAboutDto: UpdateAboutDto) {
        return this.aboutService.update(id, updateAboutDto);
    }

    @Delete(':id')
    @ApiOkResponse({
        status: 201,
        description: 'The record has been successfully deleted.'
    })
    @ApiBadRequestResponse({
        status: 404,
        description: 'Failed deleting the record.'
    })
    @ApiParam({ name: 'id' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.aboutService.remove(id);
    }
}

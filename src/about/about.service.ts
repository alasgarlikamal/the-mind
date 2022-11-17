import { BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { About } from './entities/about.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';


@Injectable()
export class AboutService {
    
    constructor(@InjectRepository(About) private aboutRepository: Repository<About>) {}

    async findAll() {
        const data = await this.aboutRepository.find();
        if(data.length === 0) throw new NotFoundException('About page not found');
        return data;
    }

    async create(createAboutDto: CreateAboutDto) {
        const creator = this.aboutRepository.create(createAboutDto);

        if (!creator) throw new BadRequestException('Failed to create');

        return await this.aboutRepository.save(creator);
    }

    async findOneById(id:number){
        const creator = await this.aboutRepository.findOneBy({ id });

        if(!creator) throw new NotFoundException(`Creator with id ${id} not found`);
        
        return creator;
    }

    async update(id: number, updateAboutDto:UpdateAboutDto) {
        const creator = await this.findOneById(id);
        
        Object.assign(creator, updateAboutDto);

        return await this.aboutRepository.save(creator);
    }

    async remove(id: number) {
        const creator = await this.findOneById(id);

        return await this.aboutRepository.remove(creator);
    }

}

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
        const data = await this.aboutRepository.find({relations: ['avatar']});
        if(data.length === 0) throw new NotFoundException('About page not found');
        return data;
    }

    async create(createAboutDto: CreateAboutDto) {
        const developer = this.aboutRepository.create(createAboutDto);

        if (!developer) throw new BadRequestException('Failed to create');

        return await this.aboutRepository.save(developer);
    }

    async findOneById(id:number){
        const developer = await this.aboutRepository.findOneBy({ id });

        if(!developer) throw new NotFoundException(`Developer with id ${id} not found`);
        
        return developer;
    }

    async update(id: number, updateAboutDto:UpdateAboutDto) {
        const developer = await this.findOneById(id);
        
        Object.assign(developer, updateAboutDto);

        return await this.aboutRepository.save(developer);
    }

    async remove(id: number) {
        const developer = await this.findOneById(id);

        return await this.aboutRepository.remove(developer);
    }

}

import { Injectable } from '@nestjs/common';
import { About } from 'src/about/entities/about.entity';
import { AvatarsService } from 'src/avatars/avatars.service';
import { Avatar } from 'src/avatars/entities/avatar.entity';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class SeederService {

    constructor(private readonly dataSource: DataSource, private readonly avatarsService: AvatarsService){}


    async seed (){
        await this.seedAbout()
        .then(completed => {Promise.resolve(completed)})
        .catch(error => {Promise.reject(error)})
    }

    async seedAbout (){
        const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');
        await queryRunner.query('TRUNCATE TABLE avatars;');
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');

        await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Avatar)
        .values([
            { imageUrl: '/images/avatars/kamal.jpg', isActive: false },
            { imageUrl: '/images/avatars/murad.jpg', isActive: false },
            { imageUrl: '/images/avatars/amina.jpg', isActive: false },
            { imageUrl: '/images/avatars/nicat.jpg', isActive: false },
            { imageUrl: '/images/avatars/arif.jpg', isActive: false },
            { imageUrl: '/images/avatars/elsa.png', isActive: true },
            { imageUrl: '/images/avatars/french.png', isActive: true },
            { imageUrl: '/images/avatars/harry.png', isActive: true },
            { imageUrl: '/images/avatars/konichuwa.png', isActive: true },
            { imageUrl: '/images/avatars/kosa.png', isActive: true },
            { imageUrl: '/images/avatars/mexican.png', isActive: true },
            { imageUrl: '/images/avatars/midsommar.png', isActive: true },
            { imageUrl: '/images/avatars/prostoy.png', isActive: true },
            { imageUrl: '/images/avatars/shanshunshin.png', isActive: true },
            { imageUrl: '/images/avatars/walter.png', isActive: true },
            { imageUrl: '/images/avatars/woman.png', isActive: true },
            
        ])
        .execute();

        await queryRunner.query('TRUNCATE TABLE about');

        await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(About)
        .values([
            {
                fullName: "Murad Isayev", 
                role:"UI/UX, Backend Developer", 
                text:"Figma, NestJs",
                avatar: await this.avatarsService.findOne(2)
            },
            {
                fullName: "Amina Ismayilzada", 
                role:"Backend Developer", 
                text:"NestJs, MySQL",
                avatar: await this.avatarsService.findOne(3)
            },
            {
                fullName: "Kamal Alasgarli", 
                role:"Team Lead, Backend Developer", 
                text:"NestJs, Redis",
                avatar: await this.avatarsService.findOne(1)
            },
            {
                fullName: "Arif Abdullayev", 
                role:"Frontend Developer, Security manager", 
                text:"ReactJs, CloudFlare",
                avatar: await this.avatarsService.findOne(5)
            },
            {
                fullName: "Nijat Abdullazada", 
                role:"Frontend Developer", 
                text:"ReactJs",
                avatar: await this.avatarsService.findOne(4)
            }
        ])
        .execute();

        

        await queryRunner.release();
    } 
}
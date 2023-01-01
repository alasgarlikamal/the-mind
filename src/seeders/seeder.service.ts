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

        await queryRunner.query('TRUNCATE TABLE about');

        await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(About)
        .values([
            {
                fullName: "Murad Isayev", 
                role:"UI/UX, Backend Developer", 
                text:"Figma, NestJs",
            },
            {
                fullName: "Amina Ismayilzada", 
                role:"Backend Developer", 
                text:"NestJs, MySQL"
            },
            {
                fullName: "Kamal Alasgarli", 
                role:"Team Lead, Backend Developer", 
                text:"NestJs, Redis"
            },
            {
                fullName: "Arif Abdullayev", 
                role:"Frontend Developer, Security manager", 
                text:"ReactJs, CloudFlare, Splunk"
            },
            {
                fullName: "Nijat Abdullazada", 
                role:"Frontend Developer", 
                text:"ReactJs"
            }
        ])
        .execute();

        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');
        await queryRunner.query('TRUNCATE TABLE avatars;');
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');

        await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Avatar)
        .values([
            { imageUrl: '/images/avatars/elsa.png' },
            { imageUrl: '/images/avatars/french.png' },
            { imageUrl: '/images/avatars/harry.png' },
            { imageUrl: '/images/avatars/konichuwa.png' },
            { imageUrl: '/images/avatars/kosa.png' },
            { imageUrl: '/images/avatars/mexican.png' },
            { imageUrl: '/images/avatars/midsommar.png' },
            { imageUrl: '/images/avatars/prostoy.png' },
            { imageUrl: '/images/avatars/shanshunshin.png' },
            { imageUrl: '/images/avatars/walter.png' },
            { imageUrl: '/images/avatars/woman.png' },
            
        ])
        .execute();

        await queryRunner.release();
    } 
}
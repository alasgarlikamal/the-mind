import { Injectable } from '@nestjs/common';
import { About } from 'src/about/entities/about.entity';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class SeederService {

    constructor(private readonly dataSource: DataSource){}


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

        await queryRunner.release();
    } 
}
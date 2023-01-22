import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { About } from 'src/about/entities/about.entity';
import { DataSource, Not, QueryRunner, Repository } from 'typeorm';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { Avatar } from './entities/avatar.entity';

@Injectable()
export class AvatarsService {
  constructor(@InjectRepository(Avatar) private repo: Repository<Avatar>,
  private readonly dataSource: DataSource) {}

  async findAll() {
    const avatars = await this.repo.find({where: {isActive: true}});
    if (avatars.length === 0) throw new NotFoundException('Avatars not found');
    return avatars;
  }

  async findOne(id: number) {
    const avatar = await this.repo.findOneBy({ id });
    if (!avatar) throw new NotFoundException('Avatar not found!');
    return avatar;
  }

  async seedAvatars() {
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
                avatar: await this.findOne(2)
            },
            {
                fullName: "Amina Ismayilzada", 
                role:"Backend Developer", 
                text:"NestJs, MySQL",
                avatar: await this.findOne(3)
            },
            {
                fullName: "Kamal Alasgarli", 
                role:"Team Lead, Backend Developer", 
                text:"NestJs, Redis",
                avatar: await this.findOne(1)
            },
            {
                fullName: "Arif Abdullayev", 
                role:"Frontend Developer, Security manager", 
                text:"ReactJs, CloudFlare",
                avatar: await this.findOne(5)
            },
            {
                fullName: "Nijat Abdullazada", 
                role:"Frontend Developer", 
                text:"ReactJs",
                avatar: await this.findOne(4)
            }
        ])
        .execute();

    return {message: 'Avatars seeded successfully!'}
  }
}

// import { About } from "src/about/entities/about.entity";
import { About } from "src/about/entities/about.entity";
import { Connection, getManager } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";

export class AboutCreateSeed implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        // await connection
        //     .createQueryBuilder()
        //     .insert()
        //     .into(About)
        //     .values([
        //         {
        //             fullName: "Murad Isayev", 
        //             role:"UI/UX, Backend Developer", 
        //             text:"Figma, NestJs",
        //         },
        //         {
        //             fullName: "Amina Ismayilzada", 
        //             role:"Backend Developer", 
        //             text:"NestJs, MySQL"
        //         },
        //         {
        //             fullName: "Kamal Alasgarli", 
        //             role:"Team Lead, Backend Developer", 
        //             text:"NestJs, Redis"
        //         },
        //         {
        //             fullName: "Arif Abdullayev", 
        //             role:"Frontend Developer, Security manager", 
        //             text:"ReactJs, CloudFlare, Splunk"
        //         },
        //         {
        //             fullName: "Nijat Abdullazada", 
        //             role:"Frontend Developer", 
        //             text:"ReactJs"
        //         }
        //     ])
        //     .execute();

        await getManager().query('TRUNCATE about');

        await factory(About)().create({
            fullName: "Murad Isayev", 
            role:"UI/UX, Backend Developer", 
            text:"Figma, NestJs",
        })

        await factory(About)().create({
            fullName: "Amina Ismayilzada", 
            role:"Backend Developer", 
            text:"NestJs, MySQL"
        })

        await factory(About)().create({
            fullName: "Kamal Alasgarli", 
            role:"Team Lead, Backend Developer", 
            text:"NestJs, Redis"
        })

        await factory(About)().create({
            fullName: "Arif Abdullayev", 
            role:"Frontend Developer, Security manager", 
            text:"ReactJs, CloudFlare, Splunk"
        })

        await factory(About)().create({
            fullName: "Nijat Abdullazada", 
            role:"Frontend Developer", 
            text:"ReactJs"
        })
    }
}
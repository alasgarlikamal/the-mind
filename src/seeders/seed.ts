import { NestFactory } from "@nestjs/core";
import { SeederModule } from "./seeder.module";
import { SeederService } from "./seeder.service";

async function bootstrap(){

    NestFactory.createApplicationContext(SeederModule).then(async appContext => {
        
        const seeder = appContext.get(SeederService);
        seeder.seed()
        .then(() => {console.log('Seeding complete!')})
        .catch(error => {console.log('Seeding failed!'); throw error})
        .finally(() => {appContext.close()});
        
    }).catch(error => { throw error});
}
bootstrap();
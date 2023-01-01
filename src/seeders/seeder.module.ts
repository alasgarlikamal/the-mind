import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from '../config/config';
import { DatabaseConfig } from "src/config/database.config";
import { SeederService } from "./seeder.service";
import { AvatarsModule } from "src/avatars/avatars.module";
import { UsersModule } from "src/users/users.module";
import { AboutModule } from "src/about/about.module";

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
        load: [config],
        envFilePath: `.env.${process.env.NODE_ENV}`
      }),
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useClass: DatabaseConfig
    }),
    AvatarsModule, UsersModule, AboutModule],
    providers: [SeederService]
})
export class SeederModule {}
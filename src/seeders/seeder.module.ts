import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from '../config/config';
import { DatabaseConfig } from "src/config/database.config";
import { SeederService } from "./seeder.service";

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
        load: [config],
        envFilePath: `.env.${process.env.NODE_ENV}`
      }),
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useClass: DatabaseConfig
    })],
    providers: [SeederService]
})
export class SeederModule {}
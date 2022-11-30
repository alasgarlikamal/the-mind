import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  } from 'class-validator';
  
  export class CreateAboutDto {
    @ApiProperty({ description: 'Creator full name', example: 'Kamal Alasgarli' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    fullName: string;
  
    @ApiProperty({ description: 'Creator email', example: 'Team Lead/Backend Developer' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    role: string;

    @ApiProperty({ description: 'Additional text', example: 'NestJs, Redis'})
    @IsString()
    @IsNotEmpty()
    text: string;
  }
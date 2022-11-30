import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsOptional,
    } from 'class-validator';
import { CreateAboutDto } from './create-about.dto';
    
export class UpdateAboutDto extends PartialType(CreateAboutDto){
    @ApiProperty({ description: 'Creator full name', example: 'Kamal Alasgarli' })
    @IsOptional()
    fullName?: string;

    @ApiProperty({ description: 'Creator role', example: 'Team Lead/Backend Developer' })
    @IsOptional()
    role?: string;

    @ApiProperty({ description: 'Additional text', example: 'NestJs, Redis'})
    @IsOptional()
    text?: string;
}
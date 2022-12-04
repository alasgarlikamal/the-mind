import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsOptional,
    } from 'class-validator';
import { CreateAboutDto } from './create-about.dto';
    
export class UpdateAboutDto extends PartialType(CreateAboutDto){
    @ApiProperty({ description: 'Developer full name', example: 'Kamal Alasgarli' })
    @ApiPropertyOptional()
    @IsOptional()
    fullName?: string;

    @ApiProperty({ description: 'Developer role', example: 'Team Lead/Backend Developer' })
    @ApiPropertyOptional()
    @IsOptional()
    role?: string;

    @ApiProperty({ description: 'Additional text', example: 'NestJs, Redis'})
    @ApiPropertyOptional()
    @IsOptional()
    text?: string;
}
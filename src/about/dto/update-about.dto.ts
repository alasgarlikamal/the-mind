import { PartialType } from '@nestjs/mapped-types';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsOptional,
    } from 'class-validator';
import { CreateAboutDto } from './create-about.dto';
    
export class UpdateAboutDto extends PartialType(CreateAboutDto){

    @IsOptional()
    fullName?: string;

    @IsOptional()
    role?: string;

    @IsOptional()
    text?: string;
}
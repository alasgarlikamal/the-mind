import {
  IsString,
  IsNotEmpty,
  MaxLength,
  } from 'class-validator';
  
  export class CreateAboutDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    fullName: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    role: string;

    @IsString()
    @IsNotEmpty()
    text: string;
  }
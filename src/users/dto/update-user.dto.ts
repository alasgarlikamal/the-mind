import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstname?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastname?: string;

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  date_of_birth?: Date;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  gender?: Boolean;
}

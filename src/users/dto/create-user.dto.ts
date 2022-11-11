import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { Avatar } from 'src/avatars/entities/avatar.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(64)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  password: string;

  @IsDateString()
  @IsNotEmpty()
  date_of_birth: Date;

  @IsBoolean()
  @IsNotEmpty()
  gender: Boolean;

  @IsNumber()
  @IsNotEmpty() //obj is a reference to original user entity. And we pull out the id.
  avatarId: number;
}

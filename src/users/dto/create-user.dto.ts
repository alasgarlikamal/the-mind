import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstname: string;

  @ApiProperty({ description: 'User surname', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastname: string;

  @ApiProperty({ description: 'User email', example: 'john@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(64)
  email: string;

  @ApiProperty({ description: 'User password', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'User birth date', example: '1990-01-01' })
  @IsDateString()
  @IsNotEmpty()
  date_of_birth: Date;

  @ApiProperty({ description: "User gender", example: true})
  @IsBoolean()
  @IsNotEmpty()
  gender: Boolean;

  @ApiProperty({ description: "User's avatar ID", example: 4 })
  @IsNumber()
  @IsNotEmpty() //obj is a reference to original user entity. And we pull out the id.
  avatarId: number;
}

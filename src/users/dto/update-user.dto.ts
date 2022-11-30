import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ description: 'User name', example: 'John' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstname?: string;

  @ApiProperty({ description: 'User surname', example: 'Doe' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastname?: string;

  @ApiProperty({ description: 'User birth date', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  date_of_birth?: Date;

  @ApiProperty({ description: "User gender", example: true})
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  gender?: Boolean;
}

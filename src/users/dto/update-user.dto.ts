import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ description: 'User name', example: 'John' })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstname?: string;

  @ApiProperty({ description: 'User surname', example: 'Doe' })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastname?: string;

  @ApiProperty({ description: 'User birth date', example: '1990-01-01' })
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  date_of_birth?: Date;

  @ApiProperty({ description: "User gender", example: true})
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  gender?: Boolean;

  @ApiProperty({ description: 'User avatar id', example: 1 })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  avatarId?: number;
}

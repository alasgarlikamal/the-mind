import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'User new password', example: '12345678910' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(1024)
  password: string;
}